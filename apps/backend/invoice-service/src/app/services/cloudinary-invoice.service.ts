import PDFDocument from 'pdfkit';
import axios from 'axios';
import { uploadToCloudinary } from '@shared/auth';
import { logger } from '@shared/logger';
import { PrismaClient } from '@prisma/client';
import { sendEmail } from '@shared/email'; // shared email utility
import { GenerateInvoiceDto, InvoiceItem } from '../dto/invoice-dto';

const prisma = new PrismaClient();

interface InvoiceOptions {
  orderId: string;
  vendorId: string;
  userId: string;
  userName: string;
  userEmail: string;
  vendorName: string;
  vendorEmail: string;
  vendorProfileImage?: string; // Cloudinary URL
  items: InvoiceItem[];
  totalAmount: number;
  paymentLink?: string;
}

export class CloudinaryInvoiceService {
  /**
   * Generates vendor + user invoices, uploads to Cloudinary, saves records in DB,
   * and sends user invoice via email
   */
  static async generateVendorAndUserInvoices(options: InvoiceOptions) {
    const {
      orderId,
      vendorId,
      userId,
      vendorName,
      vendorEmail,
      userName,
      userEmail,
      vendorProfileImage,
      items,
      totalAmount,
      paymentLink,
    } = options;

    const folder = 'invoices';

    // Prepare DTOs
    const vendorInvoiceDto: GenerateInvoiceDto = {
      title: `Invoice for Order #${orderId} (Vendor Copy)`,
      headerInfo: `Vendor: ${vendorName}\nEmail: ${vendorEmail}`,
      items,
      grandTotal: totalAmount,
      paymentLink,
      filename: `${orderId}_vendor`,
    };

    const userInvoiceDto: GenerateInvoiceDto = {
      title: `Invoice for Order #${orderId} (Customer Copy)`,
      headerInfo: `Customer: ${userName}\nEmail: ${userEmail}`,
      items,
      grandTotal: totalAmount,
      paymentLink,
      filename: `${orderId}_user`,
    };

    // Generate PDFs and upload
    const [vendorInvoiceUrl, userInvoiceUrl] = await Promise.all([
      this.generateAndUploadInvoice(vendorInvoiceDto, folder, vendorProfileImage),
      this.generateAndUploadInvoice(userInvoiceDto, folder),
    ]);

    logger.info(`[cloudinary-invoice-service] Vendor Invoice URL: ${vendorInvoiceUrl}`);
    logger.info(`[cloudinary-invoice-service] User Invoice URL:   ${userInvoiceUrl}`);

    // Save Vendor invoice in DB
    await prisma.invoice.create({
      data: {
        orderId,
        vendorId,
        pdfUrl: vendorInvoiceUrl,
      },
    });

    // Save User invoice in DB
    await prisma.invoice.create({
      data: {
        orderId,
        vendorId, // still link vendor for multi-vendor orders
        pdfUrl: userInvoiceUrl,
      },
    });

    // Send User invoice via email
    try {
      await sendEmail({
        to: userEmail,
        subject: `Your Invoice for Order #${orderId}`,
        html: `
          <p>Hi ${userName},</p>
          <p>Thank you for your order! Please find your invoice below:</p>
          <p><a href="${userInvoiceUrl}" target="_blank">Download Invoice</a></p>
          <br/>
          <p>Tentalents – committed to excellence.</p>
        `,
      });
      logger.info(`[cloudinary-invoice-service] User invoice sent to ${userEmail}`);
    } catch (err) {
      logger.error('[cloudinary-invoice-service] ❌ Failed to send email:', err);
    }

    return { vendorInvoiceUrl, userInvoiceUrl };
  }

  private static async generateAndUploadInvoice(
    dto: GenerateInvoiceDto,
    folder: string,
    profileImage?: string
  ): Promise<string> {
    const { title, headerInfo, items, grandTotal, filename, paymentLink } = dto;

    // Fetch vendor profile image if any
    let profileBuffer: Buffer | undefined;
    if (profileImage) {
      try {
        const { data } = await axios.get<ArrayBuffer>(profileImage, { responseType: 'arraybuffer' });
        profileBuffer = Buffer.from(data);
      } catch (err) {
        logger.warn(`[cloudinary-invoice-service] Could not load profile image: ${err}`);
      }
    }

    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const chunks: Buffer[] = [];

        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', async () => {
          try {
            const pdfBuffer = Buffer.concat(chunks);
            const url = await uploadToCloudinary(pdfBuffer, folder, filename);
            resolve(url);
          } catch (err) {
            logger.error('[cloudinary-invoice-service] ❌ Upload failed:', err);
            reject(err);
          }
        });

        // Header
        doc.fontSize(22).text(title, { underline: true });
        doc.moveDown().fontSize(14).text(headerInfo);
        doc.moveDown();

        // Profile image
        if (profileBuffer) {
          doc.image(profileBuffer, { width: 100, height: 100 });
          doc.moveDown();
        }

        // Items table
        doc.fontSize(16).text('Items:', { underline: true });
        items.forEach((item) => {
          doc
            .fontSize(12)
            .text(`${item.title} (x${item.quantity}) - ₹${item.unitPrice} each = ₹${item.totalPrice}`);
        });

        doc.moveDown().fontSize(16).text(`Grand Total: ₹${grandTotal}`);

        if (paymentLink) {
          doc.moveDown().fontSize(14).fillColor('blue').text(`Pay Here: ${paymentLink}`);
        }

        // Footer
        doc.moveDown().fontSize(12).fillColor('black').text('Tentalents – committed to excellence.', { align: 'center' });

        doc.end();
      } catch (err) {
        logger.error('[cloudinary-invoice-service] ❌ PDF generation failed:', err);
        reject(err);
      }
    });
  }
}
