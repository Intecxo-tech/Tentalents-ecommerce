import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { generateInvoiceAndUpload } from '@shared/utils';
import { getPresignedUrl } from '@shared/minio';

const prisma = new PrismaClient();

/**
 * Generate an invoice PDF, upload it to MinIO, and create a record in Prisma.
 */
export async function manualInvoiceGeneration(req: Request, res: Response) {
  const { orderId } = req.params;

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            vendor: true,
          },
        },
        invoice: true,
      },
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.invoice) {
      return res
        .status(409)
        .json({ error: 'Invoice already exists for this order' });
    }

    const vendorId = order.items[0]?.vendorId;
    if (!vendorId) {
      return res
        .status(400)
        .json({ error: 'No vendor associated with order items' });
    }

    // Generate invoice PDF and upload it to MinIO
    const pdfUrl = await generateInvoiceAndUpload(orderId);

    // Create invoice record in Prisma
    const invoice = await prisma.invoice.create({
      data: {
        orderId,
        vendorId,
        pdfUrl, // Store uploaded PDF URL directly
        // issuedAt will default to now()
      },
    });

    return res.status(201).json({ message: 'Invoice generated', invoice });
  } catch (err) {
    console.error('Error generating invoice:', err);
    return res.status(500).json({ error: 'Failed to generate invoice' });
  }
}

/**
 * Get a signed URL from MinIO for downloading the invoice PDF.
 */
export async function getInvoiceDownloadUrl(req: Request, res: Response) {
  const { invoiceId } = req.params;

  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
    });

    if (!invoice || !invoice.pdfUrl) {
      return res
        .status(404)
        .json({ error: 'Invoice not found or PDF URL missing' });
    }

    // Generate a temporary signed URL for download
    const signedUrl = await getPresignedUrl({
      bucketName: 'invoices',      // your MinIO bucket name
      objectName: invoice.pdfUrl,  // PDF file name stored in pdfUrl
    });

    return res.json({ signedUrl });
  } catch (err) {
    console.error('Error getting signed URL:', err);
    return res.status(500).json({ error: 'Failed to get download URL' });
  }
}
