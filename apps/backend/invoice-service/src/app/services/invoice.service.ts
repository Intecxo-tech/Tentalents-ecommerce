import nodemailer from 'nodemailer';
import { env } from '@shared/config';
import { PDFGenerator, PdfOrder } from '@shared/utils';
import { PrismaClient } from '../../../generated/invoice-service';
import { uploadToCloudinary } from '@shared/auth';
import { produceKafkaEvent } from '@shared/kafka'; 
import { KAFKA_TOPICS } from '@shared/constants';

const prisma = new PrismaClient();

export const invoiceService = {
  generateInvoice: async (orderId: string) => {
    // Fetch order including items and vendor info
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: { include: { vendor: true } } }, 
    });

    if (!order) throw new Error('Order not found');
    const vendor = order.items[0]?.vendor;
    if (!vendor) throw new Error('Vendor not found for order items');

    // Build PDF-friendly order object with fallbacks
    const pdfOrder: PdfOrder = {
      id: order.id,
      userId: order.buyerId,
      userName: 'Swapna A', // placeholder
      userEmail: 'swapnaadhav123@gmail.com', // placeholder
      vendorName: vendor.name,
      vendorEmail: vendor.email ?? '',
      items: order.items.map((i: any) => ({ // added 'any' to fix implicit type
        productId: i.productId,
        name: 'Product', // placeholder
        sku: 'SKU',      // placeholder
        quantity: i.quantity,
        price: Number(i.unitPrice),
      })),
      totalAmount: Number(order.totalAmount),
      status: order.status as string,
      createdAt: order.placedAt,
    };

    // Generate PDF
    const customerPdf = await PDFGenerator.generate(pdfOrder, 'user');

    // Upload PDF
    const cloudinaryUrl = await uploadToCloudinary(
      customerPdf,
      'customer_invoices',
      `invoice-${order.id}`,
      'application/pdf'
    );

    // Send email
    const transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
    });

    await transporter.sendMail({
      from: env.EMAIL_FROM,
      to: 'customer@example.com', // placeholder
      subject: `Invoice for Order ${order.id}`,
      html: `<p>Dear Customer,</p><p>Please find your invoice attached.</p>`,
      attachments: [
        { filename: `invoice-${order.id}.pdf`, content: customerPdf, contentType: 'application/pdf' },
      ],
    });

    // Emit Kafka event (use existing INVOICE_GENERATE topic)
    await produceKafkaEvent({
      topic: KAFKA_TOPICS.INVOICE_GENERATE,
      messages: [
        { value: JSON.stringify({ orderId: order.id, userId: order.buyerId, pdfUrl: cloudinaryUrl }) },
      ],
    });

    return { cloudinaryUrl };
  },
};
