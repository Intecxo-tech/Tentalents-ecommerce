import { generateInvoicePDFBuffer, InvoiceItem, InvoiceData } from '@shared/utils';
import { uploadFileToMinIO } from '@shared/minio';
import { PrismaClient, Prisma } from '@prisma/client';
import { logger } from '@shared/logger';
import { uploadToCloudinary } from '@shared/auth';
import { sendEmail } from '@shared/email';

const prisma = new PrismaClient();
const bucket = process.env.MINIO_BUCKET || 'invoices';
const minioEndpoint = 'http://localhost:9000'; // S3 endpoint

export const invoiceService = {
  /**
   * Generate invoice PDF, upload to Cloudinary & MinIO, send emails
   */
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

    // Prepare invoice items
    const items: InvoiceItem[] = order.items.map(item => ({
      description: item.product.title,
      unitPrice: item.unitPrice instanceof Prisma.Decimal ? item.unitPrice.toNumber() : item.unitPrice,
      quantity: item.quantity,
      taxRate: 0,
    }));

    // Construct invoice data
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

    // Generate PDF buffer
    const pdfBuffer = await generateInvoicePDFBuffer(invoiceData);
    const filename = `invoice-${order.id}.pdf`;
    const objectPath = `invoices/${filename}`;

    // --- Upload to Cloudinary ---
    let cloudinaryUrl = '';
    try {
      cloudinaryUrl = await uploadToCloudinary(pdfBuffer, 'invoices', `invoice-${order.id}`, 'application/pdf');
      logger.info(`✅ Invoice uploaded to Cloudinary: ${cloudinaryUrl}`);
    } catch (err) {
      logger.warn(`Cloudinary upload failed for order ${orderId}`, err);
    }

    // --- Upload to MinIO ---
    let minioUrl = '';
    try {
      await uploadFileToMinIO({
        bucketName: bucket,
        objectName: objectPath,
        content: pdfBuffer,
        contentType: 'application/pdf',
      });

      // Permanent public MinIO URL
      minioUrl = `${minioEndpoint}/${bucket}/${objectPath}`;
      logger.info(`✅ Invoice uploaded to MinIO: ${minioUrl}`);
    } catch (err) {
      logger.warn(`MinIO upload failed for order ${orderId}`, err);
    }

    // --- Save or update invoice record ---
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
          vendorId: firstVendor?.id ?? '',
          pdfUrl: cloudinaryUrl,
          issuedAt: new Date(),
        },
      });
    }

    // --- Send email to buyer ---
    try {
      await sendEmail({
        to: user.email,
        subject: `Invoice for Order ${order.id}`,
        html: `
          <p>Hi ${user.name || 'Customer'},</p>
          <p>Your invoice is ready. You can download it here:</p>
          <p><a href="${minioUrl}" download>Download Invoice PDF</a></p>
          <p>Thank you for your purchase!</p>
        `,
        attachments: [
          {
            filename,
            content: pdfBuffer,
            contentType: 'application/pdf',
          },
        ],
      });
      logger.info(`✅ Invoice email sent to buyer: ${user.email}`);
    } catch (err) {
      logger.warn(`Failed to send invoice email to buyer ${user.email}`, err);
    }

    // --- Send email to vendor ---
    if (firstVendor?.email) {
      try {
        await sendEmail({
          to: firstVendor.email,
          subject: `New Order ${order.id} Invoice`,
          html: `
            <p>Hi ${firstVendor.name},</p>
            <p>A new order has been placed. Invoice is ready:</p>
            <p><a href="${cloudinaryUrl}" download>Download Invoice PDF</a></p>
          `,
        });
        logger.info(`✅ Invoice email sent to vendor: ${firstVendor.email}`);
      } catch (err) {
        logger.warn(`Failed to send invoice email to vendor ${firstVendor.email}`, err);
      }
    }

    return { cloudinaryUrl, minioUrl };
  },

  /**
   * Get invoice URLs for download or preview
   */
  async getInvoiceFile(orderId: string) {
    const invoice = await prisma.invoice.findUnique({ where: { orderId } });
    if (!invoice || !invoice.pdfUrl) throw new Error('Invoice not found');

    const filename = `invoice-${orderId}.pdf`;
    const objectPath = `invoices/${filename}`;
    const minioUrl = `${minioEndpoint}/${bucket}/${objectPath}`;

    return { streamUrl: minioUrl, filename, cloudinaryUrl: invoice.pdfUrl };
  },
};