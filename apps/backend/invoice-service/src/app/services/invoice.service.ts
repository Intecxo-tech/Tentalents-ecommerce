import nodemailer from 'nodemailer';
import { env } from '@shared/config';
import { PDFGenerator } from '@shared/utils';
import { PrismaClient } from '../../../generated/invoice-service';
import { uploadToCloudinary } from '@shared/auth';
import { produceKafkaEvent } from '@shared/kafka';
import { KAFKA_TOPICS } from '@shared/constants';
import fs from 'fs/promises';

const prisma = new PrismaClient();

export const invoiceService = {
  generateInvoice: async (orderId: string) => {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: { include: { vendor: true } } },
    });

    if (!order) throw new Error('Order not found');
    const vendorId = order.items[0]?.vendor?.id;
    if (!vendorId) throw new Error('Vendor not found for order items');

    // Generate PDFs
    const pdfOrder = {
      id: order.id,
      userId: order.buyerId,
      items: order.items.map(i => ({
        productId: i.productId,
        quantity: i.quantity,
        price: Number(i.unitPrice),
      })),
      totalAmount: Number(order.totalAmount),
      status: order.status as any,
      createdAt: order.placedAt,
      updatedAt: order.updatedAt,
    };

    const customerPdf = await PDFGenerator.generate(pdfOrder, 'user');
    const vendorPdf = await PDFGenerator.generate(pdfOrder, 'vendor');

    // Upload vendor PDF to Cloudinary
    const cloudinaryUrl = await uploadToCloudinary(
      vendorPdf,
      'vendor_invoices',
      `invoice-${order.id}`,
      'application/pdf'
    );

    // Save invoice record
    await prisma.invoice.create({
      data: {
        orderId: order.id,
        vendorId,
        pdfUrl: cloudinaryUrl,
        filePath: `invoice-${order.id}.pdf`,
        bucket: 'cloudinary',
      },
    });

    // Send email directly using nodemailer
    const transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
    });

    await transporter.sendMail({
      from: env.EMAIL_FROM,
      to: 'buyer@example.com', // fetch real email if possible
      subject: `Invoice for Order ${order.id}`,
      html: `<p>Dear Customer,</p><p>Please find your invoice attached.</p>`,
      attachments: [
        { filename: `invoice-${order.id}.pdf`, content: customerPdf, contentType: 'application/pdf' },
      ],
    });

    // Emit Kafka event
    await produceKafkaEvent({
      topic: KAFKA_TOPICS.INVOICE_GENERATE,
      messages: [
        { value: JSON.stringify({ orderId: order.id, userId: order.buyerId, pdfUrl: cloudinaryUrl }) },
      ],
    });

    return { cloudinaryUrl };
  },
};
