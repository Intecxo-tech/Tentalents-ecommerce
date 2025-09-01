import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { PDFGenerator, PdfOrder, OrderItem } from '@shared/utils';
import { uploadFileToMinIO } from '@shared/minio';
import { uploadToCloudinary } from '@shared/auth';
import nodemailer from 'nodemailer';
import { env } from '@shared/config';

const prisma = new PrismaClient();

export async function generateInvoiceAutomatically(req: Request, res: Response) {
  const { orderId } = req.params;

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: { include: { vendor: true } }, buyer: true },
    });

    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.items.length === 0) return res.status(400).json({ error: 'Order has no items' });

    const vendor = order.items[0].vendor;
    if (!vendor) return res.status(400).json({ error: 'No vendor associated with order items' });

    const user = order.buyer;
    if (!user || !user.email) return res.status(400).json({ error: 'Buyer email not found' });

    const pdfOrder: PdfOrder = {
      id: order.id,
      userId: user.id,
      userName: user.name || 'Customer',
      userEmail: user.email,
      vendorName: vendor.name,
      vendorEmail: vendor.email,
      items: order.items.map<OrderItem>(i => ({
        productId: i.productId,
        name: 'Product',
        sku: 'SKU',
        quantity: i.quantity,
        price: Number(i.unitPrice),
      })),
      totalAmount: Number(order.totalAmount),
      status: order.status,
      createdAt: order.placedAt,
    };

    const pdfBuffer = await PDFGenerator.generate(pdfOrder, 'user');

    const cloudinaryUrl = await uploadToCloudinary(pdfBuffer, 'vendor_invoices', `invoice-${orderId}`, 'application/pdf');

    const minioUrl = await uploadFileToMinIO({
      content: pdfBuffer,
      objectName: `invoices/invoice-${orderId}.pdf`,
      bucketName: 'invoices',
      contentType: 'application/pdf',
    });

    await prisma.invoice.create({
      data: {
        orderId,
        vendorId: vendor.id,
        pdfUrl: cloudinaryUrl,
      },
    });

    const transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
    });

    await transporter.sendMail({
      from: env.EMAIL_FROM,
      to: user.email,
      subject: `Invoice for Order ${order.id}`,
      html: `<p>Dear ${user.name || 'Customer'},</p><p>Please find your invoice attached.</p>`,
      attachments: [{ filename: `invoice-${order.id}.pdf`, content: pdfBuffer, contentType: 'application/pdf' }],
    });

    return res.status(201).json({
      message: 'Invoice generated and emailed successfully',
      cloudinaryUrl,
      minioUrl,
    });
  } catch (err: any) {
    console.error('Error generating invoice:', err);
    return res.status(500).json({ error: 'Failed to generate invoice automatically', details: err.message });
  }
}

export async function getInvoiceDownloadUrl(req: Request, res: Response) {
  const { invoiceId } = req.params;

  try {
    const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });

    return res.status(200).json({ pdfUrl: invoice.pdfUrl });
  } catch (err: any) {
    console.error('Error fetching invoice:', err);
    return res.status(500).json({ error: 'Failed to fetch invoice', details: err.message });
  }
}
