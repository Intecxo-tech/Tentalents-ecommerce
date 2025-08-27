import PDFDocument from 'pdfkit';
import stream from 'stream';
import axios from 'axios';
import { uploadToCloudinary } from '@shared/auth';
import { logger } from '@shared/logger';
import { GenerateInvoiceDto, InvoiceItem } from '../dto/invoice-dto';

interface InvoiceOptions {
  orderId: string;
  vendorId: string;
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
   * Generates vendor + user invoices, uploads to Cloudinary
   * Does NOT save in the database
   */
  static async generateVendorAndUserInvoices(options: InvoiceOptions) {
    const {
      orderId,
      vendorId,
      userName,
      userEmail,
      vendorName,
      vendorEmail,
      vendorProfileImage,
      items,
      totalAmount,
      paymentLink,
    } = options;

    // Build DTOs
    const vendorInvoiceDto: GenerateInvoiceDto = {
      title: `Invoice for Order #${orderId} (Vendor Copy)`,
      headerInfo: `Vendor: ${vendorName}\nEmail: ${vendorEmail}`,
      items,
      grandTotal: totalAmount,
      paymentLink,
    };

    const userInvoiceDto: GenerateInvoiceDto = {
      title: `Invoice for Order #${orderId} (Customer Copy)`,
      headerInfo: `Customer: ${userName}\nEmail: ${userEmail}`,
      items,
      grandTotal: totalAmount,
      paymentLink,
    };

    // Generate PDFs and upload to Cloudinary
    const vendorInvoiceUrl = await this.generateAndUploadInvoice(vendorInvoiceDto, vendorProfileImage);
    const userInvoiceUrl = await this.generateAndUploadInvoice(userInvoiceDto);

    logger.info(`✅ Vendor & User invoices uploaded to Cloudinary for order ${orderId}`);
    return { vendorInvoiceUrl, userInvoiceUrl };
  }

  private static async generateAndUploadInvoice(dto: GenerateInvoiceDto, profileImage?: string): Promise<string> {
    const { title, headerInfo, items, grandTotal, folder = 'invoices', filename, paymentLink } = dto;

    const doc = new PDFDocument();
    const bufferStream = new stream.PassThrough();
    const chunks: Buffer[] = [];
    doc.pipe(bufferStream);

    // Header
    doc.fontSize(22).text(title, { underline: true });
    doc.moveDown().fontSize(14).text(headerInfo);
    doc.moveDown();

    // Vendor profile image
    if (profileImage) {
      try {
        const response = await axios.get(profileImage, { responseType: 'arraybuffer' });
        const buffer = Buffer.from(response.data, 'binary');
        doc.image(buffer, { width: 100, height: 100 });
        doc.moveDown();
      } catch (err) {
        logger.warn(`[cloudinary-invoice-service] Could not load profile image: ${err}`);
      }
    }

    // Items
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

    doc.end();
    bufferStream.on('data', (chunk) => chunks.push(chunk));

    return new Promise((resolve, reject) => {
      bufferStream.on('end', async () => {
        try {
          const pdfBuffer = Buffer.concat(chunks);
          const url = await uploadToCloudinary(pdfBuffer, folder, filename);
          logger.info(`✅ Invoice uploaded to Cloudinary: ${url}`);
          resolve(url);
        } catch (err) {
          logger.error('[cloudinary-invoice-service] ❌ Upload failed:', err);
          reject(err);
        }
      });

      bufferStream.on('error', (err) => {
        logger.error('[cloudinary-invoice-service] ❌ PDF stream error:', err);
        reject(err);
      });
    });
  }
}
