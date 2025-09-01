import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { PDFGenerator, PdfOrder, OrderItem } from '@shared/utils';
import { uploadFileToMinIO } from '@shared/minio';
import { uploadToCloudinary } from '@shared/auth';
import nodemailer from 'nodemailer';
import { env } from '@shared/config';
import axios from 'axios';

const prisma = new PrismaClient();

// Generate invoice and email automatically (supports regeneration)
export async function generateInvoiceAutomatically(req: Request, res: Response) {
  const { orderId } = req.params;
  const regenerate = req.query.regenerate === 'true'; // ?regenerate=true

  try {
    // Check if invoice already exists
    let existingInvoice = await prisma.invoice.findUnique({ where: { orderId } });
    if (existingInvoice && !regenerate) {
      return res.status(200).json({
        message: 'Invoice already generated',
        cloudinaryUrl: existingInvoice.pdfUrl,
        invoice: existingInvoice,
      });
    }

    // Fetch order details with product info
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { 
        items: { include: { vendor: true, product: true } }, 
        buyer: true 
      },
    });

    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.items.length === 0) return res.status(400).json({ error: 'Order has no items' });

    const vendor = order.items[0].vendor;
    if (!vendor) return res.status(400).json({ error: 'No vendor associated with order items' });

    const user = order.buyer;
    if (!user || !user.email) return res.status(400).json({ error: 'Buyer email not found' });

    // Prepare PDF data dynamically
    const pdfOrder: PdfOrder = {
      id: order.id,
      userId: user.id,
      userName: user.name || 'Customer',
      userEmail: user.email,
      userAddress: user.address || 'Address not provided',
      vendorName: vendor.name,
      vendorEmail: vendor.email,
      vendorAddress: vendor.address || 'Address not provided',
      paymentMethod: order.paymentMode || 'N/A',
      items: order.items.map<OrderItem>(i => ({
        productId: i.productId,
        name: i.product?.title || 'Product',
        sku: i.product?.slug || 'SKU',
        quantity: i.quantity,
        price: Number(i.unitPrice),
      })),
      totalAmount: Number(order.totalAmount),
      status: order.status,
      createdAt: order.placedAt,
    };

    // Generate PDF
    const pdfBuffer = await PDFGenerator.generate(pdfOrder, 'user');

    // Create a unique filename using timestamp
    const uniqueFilename = `invoice-${orderId}-${Date.now()}`;

    // Upload to Cloudinary
    const cloudinaryUrl = await uploadToCloudinary(
      pdfBuffer,
      'vendor_invoices',
      uniqueFilename,
      'application/pdf'
    );

    // Optional: Upload to MinIO
    const minioUrl = await uploadFileToMinIO({
      content: pdfBuffer,
      objectName: `invoices/${uniqueFilename}.pdf`,
      bucketName: 'invoices',
      contentType: 'application/pdf',
    });

    // Save or update invoice record
    if (existingInvoice && regenerate) {
      existingInvoice = await prisma.invoice.update({
        where: { id: existingInvoice.id },
        data: { pdfUrl: cloudinaryUrl },
      });
    } else {
      existingInvoice = await prisma.invoice.create({
        data: { orderId, vendorId: vendor.id, pdfUrl: cloudinaryUrl },
      });
    }

    // Send email with PDF attachment (optional)
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
      attachments: [{ filename: `${uniqueFilename}.pdf`, content: pdfBuffer, contentType: 'application/pdf' }],
    });

    return res.status(201).json({
      message: 'Invoice generated and emailed successfully',
      cloudinaryUrl,
      minioUrl,
      invoice: existingInvoice,
    });

  } catch (err: any) {
    console.error('Error generating invoice:', err);
    return res.status(500).json({ error: 'Failed to generate invoice', details: err.message });
  }
}

// Download invoice PDF directly
export async function getInvoiceDownloadUrl(req: Request, res: Response) {
  const { invoiceId } = req.params;

  try {
    const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });

    // Stream PDF from Cloudinary
    const response = await axios.get(invoice.pdfUrl, { responseType: 'stream' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${invoiceId}.pdf`);

    response.data.pipe(res);
  } catch (err: any) {
    console.error('Error downloading invoice:', err);
    return res.status(500).json({ error: 'Failed to download invoice', details: err.message });
  }
}
