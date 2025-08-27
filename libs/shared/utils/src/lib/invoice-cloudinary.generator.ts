import PDFDocument from 'pdfkit';
import stream from 'stream';
import { logger } from '@shared/logger';
import { uploadToCloudinary } from '@shared/auth';

export async function generateInvoiceAndUploadToCloudinary(
  orderId: string
): Promise<string> {
  const fileName = `invoice-${orderId}.pdf`;
  const folder = 'invoices';

  const doc = new PDFDocument();
  const bufferStream = new stream.PassThrough();
  const chunks: Buffer[] = [];

  doc.pipe(bufferStream);
  doc.fontSize(20).text(`🧾 Invoice #${orderId}`, { underline: true });
  doc.moveDown().text('📦 Thank you for your order!');
  doc.end();

  bufferStream.on('data', (chunk) => chunks.push(chunk));

  return new Promise((resolve, reject) => {
    bufferStream.on('end', async () => {
      try {
        const finalBuffer = Buffer.concat(chunks);

        const cloudinaryUrl = await uploadToCloudinary(
          finalBuffer,
          folder,
          fileName.replace('.pdf', '')
        );

        logger.info(`✅ Uploaded Invoice to Cloudinary: ${cloudinaryUrl}`);
        resolve(cloudinaryUrl);
      } catch (err) {
        logger.error(`[cloudinary-invoice-generator] ❌ Failed:`, err);
        reject(err);
      }
    });

    bufferStream.on('error', (err) => {
      logger.error(`[cloudinary-invoice-generator] ❌ Stream error:`, err);
      reject(err);
    });
  });
}
