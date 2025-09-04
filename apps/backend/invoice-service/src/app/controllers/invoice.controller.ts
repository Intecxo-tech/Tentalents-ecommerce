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
            vendor: true, // Include vendor information for each item
          },
        },
        invoice: true, // Check if invoice already exists
      },
    });

    if (!order) {
      console.log(`❌ [manualInvoiceGeneration] Order with id ${orderId} not found`);
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.invoice) {
      console.log(`❌ [manualInvoiceGeneration] Invoice already exists for orderId: ${orderId}`);
      return res.status(409).json({ error: 'Invoice already exists for this order' });
    }

    // Fetch vendorId from the first item in the order (assuming all items have the same vendor)
    const vendorId = order.items[0]?.vendor.id;
    console.log(`🔑 [manualInvoiceGeneration] vendorId: ${vendorId}`);

    if (!vendorId) {
      console.log(`❌ [manualInvoiceGeneration] No vendor associated with order items for orderId: ${orderId}`);
      return res.status(400).json({ error: 'No vendor associated with order items' });
    }

    // Generate and upload the invoice PDF to MinIO
    console.log(`📝 [manualInvoiceGeneration] Generating and uploading invoice for orderId: ${orderId}`);
    const pdfUrl = await generateInvoiceAndUpload(orderId); // Assuming this function now returns pdfUrl

    if (!pdfUrl) {
      console.log(`❌ [manualInvoiceGeneration] Failed to generate invoice for orderId: ${orderId}`);
      return res.status(500).json({ error: 'Failed to generate invoice PDF' });
    }

    console.log(`📤 [manualInvoiceGeneration] Invoice uploaded to MinIO for orderId: ${orderId}. PDF URL: ${pdfUrl}`);

    // Store invoice info in the database
    console.log(`💾 [manualInvoiceGeneration] Storing invoice data for orderId: ${orderId}`);
    const invoice = await prisma.invoice.create({
      data: {
        orderId,
        vendorId,
        pdfUrl,  // Store the URL of the generated PDF
        issuedAt: new Date(), // Setting the current timestamp for when the invoice is created
      },
    });

    console.log(`✅ [manualInvoiceGeneration] Invoice created successfully for orderId: ${orderId}`);
    return res.status(201).json({ message: 'Invoice generated', invoice });
  } catch (err) {
    console.error('❌ [manualInvoiceGeneration] Error generating invoice:', err);
    return res.status(500).json({ error: 'Failed to generate invoice' });
  }
}

/**
 * Get signed URL from MinIO for invoice PDF download.
 */
export async function getInvoiceDownloadUrl(req: Request, res: Response) {
  const { invoiceId } = req.params;

  console.log(`🔎 [getInvoiceDownloadUrl] Received request for invoiceId: ${invoiceId}`);

  try {
    // Fetch the invoice from the database
    console.log(`📦 [getInvoiceDownloadUrl] Fetching invoice details for invoiceId: ${invoiceId}`);
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
    });

    if (!invoice || !invoice.pdfUrl) {
      console.log(`❌ [getInvoiceDownloadUrl] Invoice not found or PDF URL missing for invoiceId: ${invoiceId}`);
      return res.status(404).json({ error: 'Invoice not found or PDF URL missing' });
    }

    console.log(`🔑 [getInvoiceDownloadUrl] Retrieving signed URL for invoiceId: ${invoiceId}`);
    // Get the signed URL from MinIO for secure file download
    const signedUrl = await getPresignedUrl({
      bucketName: 'invoices', // Assuming MinIO bucket name is 'invoices'
      objectName: invoice.pdfUrl, // Using pdfUrl here instead of filePath
    });

    console.log(`📤 [getInvoiceDownloadUrl] Signed URL generated for invoiceId: ${invoiceId}`);
    return res.json({ signedUrl });
  } catch (err) {
    console.error('❌ [getInvoiceDownloadUrl] Error getting signed URL:', err);
    return res.status(500).json({ error: 'Failed to get download URL' });
  }
}
