import PDFDocument from 'pdfkit';
import axios from 'axios';
import { uploadToCloudinary } from '@shared/auth';
import { logger } from '@shared/logger';
import { PrismaClient } from '@prisma/client';
import { sendEmail } from '@shared/email';
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
  vendorProfileImage?: string;
  items: InvoiceItem[];
  totalAmount: number;
  paymentLink?: string;
}

export class CloudinaryInvoiceService {
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

    const [vendorInvoiceUrl, userInvoiceUrl] = await Promise.all([
      this.generateAndUploadInvoice(vendorInvoiceDto, folder, vendorProfileImage),
      this.generateAndUploadInvoice(userInvoiceDto, folder),
    ]);

    logger.info(`[cloudinary-invoice-service] Vendor Invoice URL: ${vendorInvoiceUrl}`);
    logger.info(`[cloudinary-invoice-service] User Invoice URL:   ${userInvoiceUrl}`);

    await prisma.invoice.create({ data: { orderId, vendorId, pdfUrl: vendorInvoiceUrl } });
    await prisma.invoice.create({ data: { orderId, vendorId, pdfUrl: userInvoiceUrl } });

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
        doc.fontSize(22).font('Helvetica-Bold').text(title, { underline: true, align: 'center' });
        doc.moveDown();
        doc.fontSize(12).font('Helvetica').text(headerInfo, { align: 'center' });
        doc.moveDown();

        // Horizontal line
        doc.moveTo(doc.x, doc.y).lineTo(doc.page.width - doc.page.margins.right, doc.y).stroke();
        doc.moveDown();

        // Profile image top-right
        if (profileBuffer) {
          doc.image(profileBuffer, doc.page.width - 150, doc.y, { width: 100, height: 100 });
          doc.moveDown(2);
        }

        // Items table
        doc.fontSize(14).font('Helvetica-Bold').text('Itemized Details', { underline: true });
        doc.moveDown(0.5);

        const colWidths = { title: 250, qty: 50, unit: 80, total: 80 };
        doc.fontSize(12).text('Item', doc.x, doc.y, { width: colWidths.title, continued: true });
        doc.text('Qty', doc.x, doc.y, { width: colWidths.qty, continued: true, align: 'center' });
        doc.text('Unit Price', doc.x, doc.y, { width: colWidths.unit, continued: true, align: 'right' });
        doc.text('Total', doc.x, doc.y, { width: colWidths.total, align: 'right' });
        doc.moveDown(0.5).font('Helvetica');

        items.forEach((item) => {
          doc.text(item.title, doc.x, doc.y, { width: colWidths.title, continued: true });
          doc.text(`${item.quantity}`, doc.x, doc.y, { width: colWidths.qty, continued: true, align: 'center' });
          doc.text(`₹${item.unitPrice}`, doc.x, doc.y, { width: colWidths.unit, continued: true, align: 'right' });
          doc.text(`₹${item.totalPrice}`, doc.x, doc.y, { width: colWidths.total, align: 'right' });
          doc.moveDown(0.2);
        });

        doc.moveDown(1);
        doc.fontSize(16).font('Helvetica-Bold').text(`Grand Total: ₹${grandTotal}`, { align: 'right' });
        doc.font('Helvetica');

        // Payment button
        if (paymentLink) {
          const buttonWidth = 200;
          const buttonHeight = 25;
          const x = doc.x;
          const y = doc.y + 10;

          doc.rect(x, y, buttonWidth, buttonHeight).fill('#007bff');
          doc.fillColor('white').text('Pay Here', x, y + 5, {
            width: buttonWidth,
            align: 'center',
            link: paymentLink,
            underline: true,
          });
          doc.moveDown(3);
          doc.fillColor('black');
        }

        // Footer
        doc.moveDown(2)
          .fontSize(10)
          .fillColor('grey')
          .text('Tentalents – committed to excellence.', { align: 'center' });

        doc.end();
      } catch (err) {
        logger.error('[cloudinary-invoice-service] ❌ PDF generation failed:', err);
        reject(err);
      }
    });
  }
}
