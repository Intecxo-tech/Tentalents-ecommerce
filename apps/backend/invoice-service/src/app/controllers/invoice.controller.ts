import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { generateInvoiceAndUpload } from '@shared/utils'; // Assuming this returns pdfUrl
import { getPresignedUrl } from '@shared/minio'; // ✅ Corrected import

const prisma = new PrismaClient();

/**
 * Generate an invoice and upload PDF to MinIO.
 * Associates it with the order and vendor.
 */
export async function manualInvoiceGeneration(req: Request, res: Response) {
  const { orderId } = req.params;

  console.log(`🔎 [manualInvoiceGeneration] Received request for orderId: ${orderId}`);

  try {
    // Fetch order details including items and associated vendor
    console.log(`📦 Fetching order details for orderId: ${orderId}`);
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
      console.log(`❌ Order with id ${orderId} not found`);
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.invoice) {
      console.log(`❌ Invoice already exists for orderId: ${orderId}`);
      return res.status(409).json({ error: 'Invoice already exists for this order' });
    }

    const vendorId = order.items[0]?.vendor.id;
    if (!vendorId) {
      return res.status(400).json({ error: 'No vendor associated with order items' });
    }

    // ✅ Generate invoice and upload
    const pdfUrl = await generateInvoiceAndUpload(orderId);

    if (!pdfUrl) {
      return res.status(500).json({ error: 'Failed to generate invoice PDF' });
    }

    console.log(`✅ Invoice generated and uploaded. URL: ${pdfUrl}`);

    return res.status(201).json({
      message: 'Invoice generated successfully',
      pdfUrl,
    });
  } catch (err) {
    console.error('❌ Error generating invoice:', err);
    return res.status(500).json({ error: 'Failed to generate invoice' });
  }
}


/**
 * Get signed URL from MinIO for invoice PDF download.
 */
export async function getInvoiceDownloadUrl(req: Request, res: Response) {
  const { orderId } = req.params;
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { orderId },
    });

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    if (!invoice.pdfUrl) {
      return res.status(404).json({ error: 'Invoice PDF URL missing' });
    }

    return res.json({ signedUrl: invoice.pdfUrl });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to get download URL' });
  }
}