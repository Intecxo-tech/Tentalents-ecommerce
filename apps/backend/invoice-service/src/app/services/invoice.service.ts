import { PDFGenerator, PdfOrder, OrderItem } from '@shared/utils';
import { uploadToCloudinary } from '@shared/auth';
import { uploadFileToMinIO } from '@shared/minio';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const bucket = process.env.MINIO_BUCKET || 'invoices';

export const invoiceService = {
  /**
   * Generate PDF invoice, upload to Cloudinary and MinIO, save in DB
   */
  generateInvoicePDF: async (orderData: {
    orderId: string;
    userId: string;
    buyerEmail: string;
    buyerName?: string;
    items: { name: string; price: number; quantity: number; savedForLater?: boolean }[];
    total: number;
    shippingCost?: number;
    paymentMethod?: string;
  }): Promise<{ cloudinaryUrl: string; minioUrl: string }> => {

    // Map items to OrderItem for PDF
    const pdfItems: OrderItem[] = orderData.items.map(i => ({
      productId: '', // optional
      name: i.name,
      quantity: i.quantity,
      price: i.price,
      savedForLater: i.savedForLater ?? false,
    }));

    const pdfOrder: PdfOrder = {
      id: orderData.orderId,
      userId: orderData.userId,
      userName: orderData.buyerName || 'Customer',
      userEmail: orderData.buyerEmail,
      items: pdfItems,
      status: 'PAID',
      createdAt: new Date(),
      shippingCost: orderData.shippingCost,
      paymentMethod: orderData.paymentMethod,
    };

    // Generate PDF
    const pdfBuffer = await PDFGenerator.generate(pdfOrder);
    const filename = `tentalents-invoice-${orderData.orderId}.pdf`;

    // Upload PDF to Cloudinary
    const cloudinaryUrl = await uploadToCloudinary(
      pdfBuffer,
      'invoices',
      filename,
      'application/pdf'
    );

    // Upload PDF to MinIO
    const minioUrl = await uploadFileToMinIO({
      content: pdfBuffer,
      objectName: `invoices/${filename}`,
      bucketName: bucket,
      contentType: 'application/pdf',
    });

    // Check if invoice exists in DB
    const existingInvoice = await prisma.invoice.findUnique({
      where: { orderId: orderData.orderId },
    });

    if (existingInvoice) {
      // Update pdfUrl only
      await prisma.invoice.update({
        where: { id: existingInvoice.id },
        data: { pdfUrl: cloudinaryUrl },
      });
    } else {
      // Fetch vendorId from first order item
      const orderItem = await prisma.orderItem.findFirst({
        where: { orderId: orderData.orderId },
        include: { vendor: true },
      });
      const vendorId = orderItem?.vendor?.id || '';

      await prisma.invoice.create({
        data: {
          orderId: orderData.orderId,
          vendorId,
          pdfUrl: cloudinaryUrl,
          issuedAt: new Date(),
        },
      });
    }

    return { cloudinaryUrl, minioUrl };
  },

  /**
   * Get invoice PDF URL from DB
   */
  getInvoiceFile: async (orderId: string): Promise<string> => {
    const invoice = await prisma.invoice.findUnique({ where: { orderId } });
    if (!invoice || !invoice.pdfUrl) throw new Error('Invoice not found');
    return invoice.pdfUrl;
  },
};
