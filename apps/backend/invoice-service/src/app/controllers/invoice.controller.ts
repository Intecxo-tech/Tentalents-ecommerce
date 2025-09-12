import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { generateInvoicePDFBuffer, InvoiceData, InvoiceItem } from '@shared/utils';
import { minioClient, uploadFileToMinIO } from '@shared/minio';
import { uploadToCloudinary } from '@shared/auth';
import nodemailer from 'nodemailer';
import { env } from '@shared/config';

const prisma = new PrismaClient();

/**
 * 📄 Generate invoice automatically for an order
 * Supports regeneration, uploads to Cloudinary & MinIO, saves DB, emails buyer
 */
export async function generateInvoiceAutomatically(req: Request, res: Response) {
  const { orderId } = req.params;
  const regenerate = req.query.regenerate === 'true';

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

    // Fetch order with buyer and vendor info
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: { include: { vendor: true, product: true } },
        buyer: true,
      },
    });

    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (!order.items?.length) return res.status(400).json({ error: 'Order has no items' });

    const buyer = order.buyer;
    if (!buyer || !buyer.email) return res.status(400).json({ error: 'Buyer email not found' });

    const vendor = order.items[0].vendor;
    if (!vendor) return res.status(400).json({ error: 'Vendor info missing' });

    // Use buyer address (schema only has buyer.address)
    const userAddress = buyer.address || 'Address not provided';
    const vendorAddress = vendor.address || 'Address not provided';

    // Prepare InvoiceData for PDF generation
    const invoiceItems: InvoiceItem[] = order.items.map((i) => ({
      description: i.product?.title || 'Product',
      unitPrice: Number(i.unitPrice),
      quantity: i.quantity,
      taxRate: 0, // adjust if you have tax
    }));

    const invoiceData: InvoiceData = {
      orderId: order.id,
      customerName: buyer.name || 'Customer',
      customerEmail: buyer.email,
      billingAddress: userAddress,
      shippingAddress: userAddress,
      vendorName: vendor.name,
      vendorAddress: vendorAddress,
      gstNumber: vendor.gstNumber || '',
      panNumber: vendor.panNumber || '',
      items: invoiceItems,
      date: new Date().toISOString().split('T')[0],
    };

    // Generate PDF buffer
    const pdfBuffer = await generateInvoicePDFBuffer(invoiceData);

    const uniqueFilename = `invoice-${orderId}-${Date.now()}.pdf`;

    // Upload PDF to Cloudinary
    const cloudinaryUrl = await uploadToCloudinary(pdfBuffer, 'invoices', uniqueFilename, 'application/pdf');

    // Upload PDF to MinIO
    const minioUrl = await uploadFileToMinIO({
      content: pdfBuffer,
      objectName: `invoices/${uniqueFilename}`,
      bucketName: 'invoices',
      contentType: 'application/pdf',
    });

    // Save or update invoice in DB (no filename field)
    if (existingInvoice && regenerate) {
      existingInvoice = await prisma.invoice.update({
        where: { id: existingInvoice.id },
        data: { pdfUrl: cloudinaryUrl, issuedAt: new Date() },
      });
    } else {
      existingInvoice = await prisma.invoice.create({
        data: {
          orderId,
          vendorId: vendor.id,
          pdfUrl: cloudinaryUrl,
          issuedAt: new Date(),
        },
      });
    }

    // Send invoice via email
    const transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
    });

    await transporter.sendMail({
      from: env.EMAIL_FROM,
      to: buyer.email,
      subject: `Invoice for Order ${order.id}`,
      html: `<p>Dear ${buyer.name || 'Customer'},</p><p>Please find your invoice attached.</p>`,
      attachments: [{ filename: uniqueFilename, content: pdfBuffer, contentType: 'application/pdf' }],
    });

    return res.status(201).json({
      message: 'Invoice generated, uploaded, saved, and emailed successfully',
      cloudinaryUrl,
      minioUrl,
      invoice: existingInvoice,
    });
  } catch (err: any) {
    console.error('❌ Error generating invoice:', err);
    return res.status(500).json({ error: 'Failed to generate invoice', details: err.message });
  }
}

/**
 * 📥 Download invoice by orderId (MinIO primary, Cloudinary fallback)
 */
export async function downloadInvoice(req: Request, res: Response) {
  const { orderId } = req.params;

  try {
    const invoice = await prisma.invoice.findUnique({ where: { orderId } });
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });

    const filename = `invoice-${orderId}.pdf`;

    try {
      const minioStream = await minioClient.getObject('invoices', `invoices/${filename}`);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
      return minioStream.pipe(res);
    } catch (minioErr) {
      console.warn('⚠️ MinIO fetch failed, falling back to Cloudinary:', minioErr);
      if (invoice.pdfUrl) {
        return res.redirect(`${invoice.pdfUrl}?response-content-disposition=attachment;filename=${filename}`);
      }
      throw new Error('Invoice file unavailable');
    }
  } catch (err: any) {
    console.error('❌ Error downloading invoice:', err);
    return res.status(500).json({ error: 'Failed to download invoice', details: err.message });
  }
}
