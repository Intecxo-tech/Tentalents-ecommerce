import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { PDFGenerator, PdfOrder, OrderItem } from '@shared/utils';
import { uploadFileToMinIO } from '@shared/minio';
import { uploadToCloudinary } from '@shared/auth';

const prisma = new PrismaClient();

export async function generateInvoiceAutomatically(req: Request, res: Response) {
  const { orderId } = req.params;

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: { include: { vendor: true } } },
    });

    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.items.length === 0) return res.status(400).json({ error: 'Order has no items' });

    const vendorId = order.items[0].vendor?.id;
    if (!vendorId) return res.status(400).json({ error: 'No vendor associated with order items' });

    // Map Prisma order to PdfOrder (use only existing fields)
    const pdfOrder: PdfOrder = {
      id: order.id,
      userId: order.buyerId,
      userName: 'Customer',           // placeholder
      userEmail: 'customer@example.com', // placeholder
      vendorName: order.items[0].vendor?.name || 'Vendor',
      vendorEmail: order.items[0].vendor?.email,
      items: order.items.map<OrderItem>(i => ({
        productId: i.productId,
        name: 'Product',  // placeholder
        sku: 'SKU',       // placeholder
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

    const invoice = await prisma.invoice.create({
      data: {
        orderId,
        vendorId,
        pdfUrl: cloudinaryUrl,
      },
    });

    return res.status(201).json({
      message: 'Invoice generated successfully',
      cloudinaryUrl,
      minioUrl,
      invoice,
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
