import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';
import { generateInvoicePDFBuffer, InvoiceData } from '@shared/utils';
import { minioClient, uploadFileToMinIO } from '@shared/minio';
import { uploadToCloudinary } from '@shared/auth';
import { env } from '@shared/config';

const prisma = new PrismaClient();

/**
 * 📄 Generate invoice, upload to Cloudinary & MinIO, save/update DB, and email buyer
 */
export async function generateInvoiceAutomatically(req: Request, res: Response) {
  const { orderId } = req.params;
  const regenerate = req.query.regenerate === 'true';

  try {
    // Check existing invoice
    let existingInvoice = await prisma.invoice.findUnique({ where: { orderId } });
    if (existingInvoice && !regenerate) {
      return res.status(200).json({
        message: 'Invoice already generated',
        cloudinaryUrl: existingInvoice.pdfUrl,
        invoice: existingInvoice,
      });
    }

    // Fetch order + buyer + vendor
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: { include: { vendor: true, product: true } },
        buyer: true,
      },
    });

    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (!order.items?.length) return res.status(400).json({ error: 'Order has no items' });

    const vendor = order.items[0]?.vendor;
    const user = order.buyer;

    if (!vendor || !user?.email) {
      return res.status(400).json({ error: 'Vendor or buyer info missing' });
    }

    // Map items for invoice
    const invoiceItems = order.items.map((i) => ({
      description: i.product?.title || 'Product',
      unitPrice: Number(i.unitPrice),
      quantity: i.quantity,
      taxRate: (i as any).taxRate ?? 0, // default 0 if not in DB
    }));

    // Prepare invoice data
const invoiceData: InvoiceData = {
  orderId: order.id,
  customerName: user.name || 'Customer',
  customerEmail: user.email, // required
  billingAddress: user.address || 'Billing address not provided',
  shippingAddress: user.address || 'Shipping address not provided',
  gstNumber: vendor.gstNumber ?? 'GST Not Available',
  panNumber: vendor.panNumber ?? 'PAN Not Available',
  items: invoiceItems,
  date: new Date(order.placedAt).toLocaleDateString('en-IN'),
};


    // Generate PDF buffer
    const pdfBuffer = await generateInvoicePDFBuffer(invoiceData);
    const filename = `tentalents-invoice-${orderId}.pdf`;

    // Upload to Cloudinary
    const cloudinaryUrl = await uploadToCloudinary(pdfBuffer, 'invoices', filename, 'application/pdf');

    // Upload to MinIO
    const minioUrl = await uploadFileToMinIO({
      content: pdfBuffer,
      objectName: `invoices/${filename}`,
      bucketName: 'invoices',
      contentType: 'application/pdf',
    });

    // Save or update DB
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

    // Email buyer
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
      html: `<p>Dear ${user.name || 'Customer'},</p>
             <p>Thank you for shopping with Tentalents. Your invoice is attached below.</p>`,
      attachments: [{ filename, content: pdfBuffer, contentType: 'application/pdf' }],
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
 * 📥 Download invoice by orderId
 */
export async function downloadInvoice(req: Request, res: Response) {
  const { orderId } = req.params;
  const filename = `tentalents-invoice-${orderId}.pdf`;

  try {
    const invoice = await prisma.invoice.findUnique({ where: { orderId } });
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });

    // Try MinIO first
    try {
      const stream = await minioClient.getObject('invoices', `invoices/${filename}`);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
      return stream.pipe(res);
    } catch (err) {
      console.warn('⚠️ MinIO fetch failed, using Cloudinary fallback:', err);
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
