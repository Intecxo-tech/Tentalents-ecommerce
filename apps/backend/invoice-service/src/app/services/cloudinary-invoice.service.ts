// apps/invoice-service/src/app/services/cloudinary-invoice.service.ts
import PDFDocument from 'pdfkit';
import stream from 'stream';
import { uploadToCloudinary } from '@shared/auth';
import { GenerateInvoiceDto } from '../dto/invoice.dto';
import { logger } from '@shared/logger';

export class CloudinaryInvoiceService {
  static async generateAndUploadInvoice(data: GenerateInvoiceDto): Promise<string> {
    const { title, headerInfo, items, grandTotal, folder = 'invoices', filename, paymentLink } = data;

    const doc = new PDFDocument();
    const bufferStream = new stream.PassThrough();
    const chunks: Buffer[] = [];

    doc.pipe(bufferStream);

    // Header
    doc.fontSize(22).text(title, { underline: true });
    doc.moveDown().fontSize(14).text(headerInfo);
    doc.moveDown();

    // Items
    doc.fontSize(16).text('Items:', { underline: true });
    items.forEach((item) => {
      doc.fontSize(12).text(`${item.title} (x${item.quantity}) - ₹${item.unitPrice} each = ₹${item.totalPrice}`);
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
