import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { generateInvoiceAndUpload } from '@shared/utils';
import { uploadFileToMinIO } from '@shared/minio';
import { uploadToCloudinary } from '@shared/auth';
import fs from 'fs/promises';

const prisma = new PrismaClient();

/**
 * Automatically generate an invoice for an order and upload to Cloudinary + MinIO.
 */
export async function generateInvoiceAutomatically(req: Request, res: Response) {
  const { orderId } = req.params;

  try {
    // Fetch order with items and existing invoice
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: { include: { vendor: true } },
        invoice: true,
      },
    });

    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.invoice) return res.status(409).json({ error: 'Invoice already exists' });

    const vendorId = order.items[0]?.vendor?.id;
    if (!vendorId) return res.status(400).json({ error: 'No vendor associated with order items' });

    // Generate invoice PDF file path
    const filePath = await generateInvoiceAndUpload(orderId);

    // Read file as Buffer
    const fileBuffer = await fs.readFile(filePath);

    // Upload to Cloudinary
    const cloudinaryUrl = await uploadToCloudinary(
      fileBuffer,
      'vendor_invoices',
      `invoice-${orderId}`,
      'application/pdf'
    );

    // Upload to MinIO
    const minioUrl = await uploadFileToMinIO({
      content: fileBuffer,
      objectName: `invoices/invoice-${orderId}.pdf`,
      bucketName: 'invoices',
      contentType: 'application/pdf',
    });

    // Save invoice record in DB (only include fields in your Prisma schema)
    const invoice = await prisma.invoice.create({
      data: {
        orderId,
        vendorId,
        pdfUrl: cloudinaryUrl,
      },
    });

    return res.status(201).json({
      message: 'Invoice generated and uploaded automatically to Cloudinary & MinIO',
      cloudinaryUrl,
      minioUrl,
      invoice,
    });
  } catch (err) {
    console.error('Error generating invoice:', err);
    return res.status(500).json({ error: 'Failed to generate invoice automatically' });
  }
}

/**
 * Get the invoice download URL by invoice ID.
 */
export async function getInvoiceDownloadUrl(req: Request, res: Response) {
  const { invoiceId } = req.params;

  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
    });

    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });

    return res.status(200).json({
      pdfUrl: invoice.pdfUrl,
    });
  } catch (err) {
    console.error('Error fetching invoice:', err);
    return res.status(500).json({ error: 'Failed to fetch invoice' });
  }
}