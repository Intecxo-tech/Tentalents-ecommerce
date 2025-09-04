import { PrismaClient } from '@prisma/client';
import { PDFGenerator, PdfOrder, OrderItem } from '@shared/utils';
import { uploadFileToMinIO } from '@shared/minio';
import { uploadToCloudinary } from '@shared/auth';
import nodemailer from 'nodemailer';
import { env } from '@shared/config';

const prisma = new PrismaClient();

export class InvoiceService {
  // Generate invoice for both customer and vendor
  static async generateInvoices(order: any): Promise<void> {
    const user = order.buyer;
    const vendor = order.items?.[0]?.vendor;
    if (!user || !user.email || !vendor) return;

    const pdfOrder: PdfOrder = {
      id: order.id,
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      userAddress: user.address,
      vendorName: vendor.name,
      vendorEmail: vendor.email,
      vendorAddress: vendor.address,
      paymentMethod: order.paymentMode,
      items: (order.items as any[]).map((i: any): OrderItem => ({
        productId: i.productId,
        name: i.product?.title,
        sku: i.product?.slug,
        quantity: i.quantity,
        price: Number(i.unitPrice),
      })),
      totalAmount: Number(order.totalAmount),
      status: order.status,
      createdAt: order.placedAt,
    };

    const timestamp = Date.now();

    // 1️⃣ Customer Invoice
    const customerPdfBuffer = await PDFGenerator.generate(pdfOrder, 'user');
    const customerFilename = `invoice-${order.id}-customer-${timestamp}`;

    const customerCloudUrl = await uploadToCloudinary(
      customerPdfBuffer,
      'invoices',
      customerFilename,
      'application/pdf'
    );

    await uploadFileToMinIO({
      content: customerPdfBuffer,
      objectName: `invoices/${customerFilename}.pdf`,
      bucketName: 'invoices',
      contentType: 'application/pdf',
    });

    // Save customer invoice record
    await prisma.invoice.create({
      data: {
        orderId: order.id,
        vendorId: vendor.id,
        pdfUrl: customerCloudUrl,
      },
    });

    // Email customer
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
      html: `<p>Dear ${user.name || 'Customer'},</p><p>Thank you for your order! Please find your invoice attached.</p>`,
      attachments: [
        {
          filename: `${customerFilename}.pdf`,
          content: customerPdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    });

    // 2️⃣ Vendor Invoice
    const vendorPdfBuffer = await PDFGenerator.generate(pdfOrder, 'vendor');
    const vendorFilename = `invoice-${order.id}-vendor-${timestamp}`;

    const vendorCloudUrl = await uploadToCloudinary(
      vendorPdfBuffer,
      'vendor_invoices',
      vendorFilename,
      'application/pdf'
    );

    await uploadFileToMinIO({
      content: vendorPdfBuffer,
      objectName: `vendor_invoices/${vendorFilename}.pdf`,
      bucketName: 'vendor_invoices',
      contentType: 'application/pdf',
    });

    // Save vendor invoice record
    await prisma.invoice.create({
      data: {
        orderId: order.id,
        vendorId: vendor.id,
        pdfUrl: vendorCloudUrl,
      },
    });

    // Optionally email vendor
    if (vendor.email) {
      await transporter.sendMail({
        from: env.EMAIL_FROM,
        to: vendor.email,
        subject: `Invoice for Order ${order.id}`,
        html: `<p>Dear ${vendor.name || 'Vendor'},</p><p>An invoice has been generated for your order items.</p>`,
        attachments: [
          {
            filename: `${vendorFilename}.pdf`,
            content: vendorPdfBuffer,
            contentType: 'application/pdf',
          },
        ],
      });
    }
  }
}
