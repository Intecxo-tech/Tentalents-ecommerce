import { generateInvoicePDFBuffer, InvoiceItem, InvoiceData } from '@shared/utils';
import { uploadToCloudinary } from '@shared/auth';
import { uploadFileToMinIO, getPresignedUrl } from '@shared/minio';
import { PrismaClient, Prisma } from '@prisma/client';
import { logger } from '@shared/logger';
import path from 'path';

const prisma = new PrismaClient();
const bucket = process.env.MINIO_BUCKET || 'invoice-files';

export const invoiceService = {
  generateInvoice: async (
    orderId: string
  ): Promise<{ cloudinaryUrl: string; minioUrl: string }> => {
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
    const cloudinaryUrl = await uploadToCloudinary(pdfBuffer, 'invoices', filename, 'application/pdf');

    // Upload to MinIO
    await uploadFileToMinIO({
      bucketName: bucket,
      objectName: `invoices/${filename}`,
      content: pdfBuffer,
      contentType: 'application/pdf',
    });

    const minioUrl = `invoices/${filename}`;

    // Save/update invoice in DB
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

  getInvoiceFile: async (orderId: string): Promise<{ streamUrl: string; filename: string }> => {
    const invoice = await prisma.invoice.findUnique({ where: { orderId } });
    if (!invoice || !invoice.pdfUrl) throw new Error('Invoice not found');

    const objectPath = `invoices/tentalents-invoice-${orderId}.pdf`;
    const presignedUrl = await getPresignedUrl({
      bucketName: bucket,
      objectName: objectPath,
    });

    return { streamUrl: presignedUrl, filename: path.basename(objectPath) };
  },
};
