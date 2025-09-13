import { generateInvoicePDFBuffer, InvoiceItem, InvoiceData } from '@shared/utils';
import { uploadToCloudinary } from '@shared/auth';
import { uploadFileToMinIO } from '@shared/minio';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const bucket = process.env.MINIO_BUCKET || 'invoices';

export const invoiceService = {
  /**
   * 🧾 Generate invoice PDF, upload to Cloudinary & MinIO, and save in DB.
   */
  generateInvoice: async (
    orderId: string
  ): Promise<{ cloudinaryUrl: string; minioUrl: string; pdfBuffer: Buffer }> => {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: { include: { vendor: true, product: true } },
        buyer: true,
      },
    });

    if (!order) throw new Error('Order not found');

    const user = order.buyer;
    const vendor = order.items[0]?.vendor;

    const items: InvoiceItem[] = order.items.map((item) => ({
      description: item.product.title,
      unitPrice: item.unitPrice.toNumber(),
      quantity: item.quantity,
      taxRate: 0,
    }));

    const invoiceData: InvoiceData = {
      orderId: order.id,
      customerName: user.name || 'Customer',
      customerEmail: user.email,
      billingAddress: user.address || '',
      shippingAddress: user.address || '',
      gstNumber: vendor?.gstNumber ?? '',
      panNumber: vendor?.panNumber ?? '',
      vendorName: vendor?.name,
      items,
      date: order.placedAt.toISOString().split('T')[0],
    };

    // Generate PDF
    const pdfBuffer = await generateInvoicePDFBuffer(invoiceData);
    const filename = `tentalents-invoice-${order.id}.pdf`;

    // Upload to Cloudinary
    const cloudinaryUrl = await uploadToCloudinary(
      pdfBuffer,
      'invoices',
      filename,
      'application/pdf'
    );

    // Upload to MinIO
    const minioUrl = await uploadFileToMinIO({
      content: pdfBuffer,
      objectName: `invoices/${filename}`,
      bucketName: bucket,
      contentType: 'application/pdf',
    });

    // Save invoice in DB
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
          vendorId: vendor?.id,
          pdfUrl: cloudinaryUrl,
          issuedAt: new Date(),
        },
      });
    }

    return { cloudinaryUrl, minioUrl, pdfBuffer };
  },

  /**
   * 📄 Get invoice PDF URL from DB
   */
  getInvoiceFile: async (orderId: string): Promise<string> => {
    const invoice = await prisma.invoice.findUnique({ where: { orderId } });
    if (!invoice || !invoice.pdfUrl) throw new Error('Invoice not found');
    return invoice.pdfUrl;
  },
};
