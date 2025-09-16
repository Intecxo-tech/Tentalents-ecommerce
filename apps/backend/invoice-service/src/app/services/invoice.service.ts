import { generateInvoicePDFBuffer, InvoiceItem, InvoiceData } from '@shared/utils';
import { uploadToCloudinary } from '@shared/auth';
import { uploadFileToMinIO, getPresignedUrl } from '@shared/minio';
import { PrismaClient, Prisma } from '@prisma/client';
import { v2 as cloudinary } from 'cloudinary';
import { logger } from '@shared/logger';

const prisma = new PrismaClient();
const bucket = process.env.MINIO_BUCKET || 'invoice-files';

export const invoiceService = {
  async generateInvoice(orderId: string): Promise<{ cloudinaryUrl: string; minioUrl: string }> {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        buyer: true,
        items: { include: { product: true, vendor: true } },
        shippingAddress: true,
      },
    });

    if (!order) throw new Error('Order not found');

    const user = order.buyer;
    const firstVendor = order.items[0]?.vendor;
    const shippingAddress = order.shippingAddress
      ? `${order.shippingAddress.addressLine1}, ${order.shippingAddress.addressLine2 || ''}, ${order.shippingAddress.city}, ${order.shippingAddress.state}, ${order.shippingAddress.pinCode}`
      : user.address || 'No shipping address';

    const items: InvoiceItem[] = order.items.map((item) => ({
      description: item.product.title,
      unitPrice: item.unitPrice instanceof Prisma.Decimal ? item.unitPrice.toNumber() : item.unitPrice,
      quantity: item.quantity,
      taxRate: 0,
    }));

    const invoiceData: InvoiceData = {
      orderId: order.id,
      customerName: user.name || 'Customer',
      customerEmail: user.email,
      billingAddress: user.address || shippingAddress,
      shippingAddress,
      gstNumber: firstVendor?.gstNumber ?? '',
      panNumber: firstVendor?.panNumber ?? '',
      vendorName: firstVendor?.name,
      vendorAddress: firstVendor?.address || '',
      items,
      date: order.placedAt.toISOString().split('T')[0],
    };

    const pdfBuffer = await generateInvoicePDFBuffer(invoiceData);
    const filename = `tentalents-invoice-${order.id}.pdf`;

    // Upload to Cloudinary
    let cloudinaryUrl = '';
    try {
      await uploadToCloudinary(pdfBuffer, 'invoices', filename, 'application/pdf');
      const cloudName = cloudinary.config().cloud_name;
      cloudinaryUrl = `https://res.cloudinary.com/${cloudName}/raw/upload/invoices/${filename}`;
    } catch (err) {
      logger.warn(`Cloudinary upload failed for order ${orderId}`, err);
    }

    // Upload to MinIO
    const objectPath = `invoices/${filename}`;
    await uploadFileToMinIO({
      bucketName: bucket,
      objectName: objectPath,
      content: pdfBuffer,
      contentType: 'application/pdf',
    });

    const minioUrl = objectPath;

    // Save or update invoice record
    const existingInvoice = await prisma.invoice.findUnique({ where: { orderId: order.id } });
    if (existingInvoice) {
      await prisma.invoice.update({
        where: { id: existingInvoice.id },
        data: { pdfUrl: cloudinaryUrl },
      });
    } else {
      await prisma.invoice.create({
        data: {
          orderId: order.id,
          vendorId: firstVendor?.id,
          pdfUrl: cloudinaryUrl,
          issuedAt: new Date(),
        },
      });
    }

    logger.info(`✅ Invoice generated for order ${orderId}`);
    return { cloudinaryUrl, minioUrl };
  },

  async getInvoiceFile(orderId: string): Promise<{
    streamUrl: string;
    filename: string;
    cloudinaryPreviewUrl: string;
    cloudinaryDownloadUrl: string;
  }> {
    const invoice = await prisma.invoice.findUnique({ where: { orderId } });
    if (!invoice || !invoice.pdfUrl) throw new Error('Invoice not found');

    const filename = `tentalents-invoice-${orderId}.pdf`;
    const objectPath = `invoices/${filename}`;

    const streamUrl = await getPresignedUrl({
      bucketName: bucket,
      objectName: objectPath,
    });

    const cloudName = cloudinary.config().cloud_name;
    const cloudinaryPreviewUrl = `https://res.cloudinary.com/${cloudName}/raw/upload/invoices/${filename}`;
    const cloudinaryDownloadUrl = `${cloudinaryPreviewUrl}?fl_attachment=true`;

    return {
      streamUrl,
      filename,
      cloudinaryPreviewUrl,
      cloudinaryDownloadUrl,
    };
  },
};
