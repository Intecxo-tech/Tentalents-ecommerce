import PDFDocument from 'pdfkit';
import { uploadToCloudinary } from '@shared/auth'; // Adjust path to where you have your cloudinary.ts file
import { PrismaClient } from '@prisma/client'; // Adjust path if you're not using @shared/prisma
import { Readable } from 'stream';

const prisma = new PrismaClient();
const bucket = process.env.MINIO_BUCKET || 'invoices';

export const invoiceService = {
  generateInvoicePDF: async (orderData: {
    orderId: string;
    userId: string;
    buyerEmail: string;
    items: { name: string; price: number; quantity: number }[];
    total: number;
  }): Promise<string> => {
    const doc = new PDFDocument();
    const chunks: Buffer[] = [];

    return new Promise<string>((resolve, reject) => {
      doc.text('🧾 MVP Shop Invoice', { align: 'center' });
      doc.text(`Order ID: ${orderData.orderId}`);
      doc.text(`Buyer: ${orderData.buyerEmail}`);
      doc.text(`Date: ${new Date().toLocaleDateString()}`);
      doc.moveDown();

      orderData.items.forEach((item) => {
        doc.text(`${item.name} - ₹${item.price} x ${item.quantity}`);
      });

      doc.text(`\nTotal: ₹${orderData.total}`, { align: 'right' });

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', async () => {
        try {
          const buffer = Buffer.concat(chunks);
          const filename = `invoice-${orderData.orderId}.pdf`;

          // Upload PDF to Cloudinary
          const pdfUrl = await uploadToCloudinary(buffer, 'invoices', filename, 'application/pdf');

          // Get the vendorId from the database based on the order's items (assuming vendor is stored in orderItem)
          const orderItems = await prisma.orderItem.findMany({
            where: { orderId: orderData.orderId },
            include: { vendor: true }, // Include vendor to get the vendor details
            take: 1,
          });

          if (orderItems.length === 0 || !orderItems[0].vendor) {
            throw new Error('No vendor found for the order');
          }

          const vendorId = orderItems[0].vendor.id; // Access the vendorId from the vendor relation

          // Store the invoice in the database with Cloudinary URL
          await prisma.invoice.create({
            data: {
              orderId: orderData.orderId,
              vendorId: vendorId,  // Use vendorId from the related vendor object
              pdfUrl: pdfUrl,  // Cloudinary URL for the uploaded invoice
              issuedAt: new Date(),
            },
          });

       resolve(pdfUrl); 
        } catch (err) {
          console.error('Error generating invoice:', err);
          reject(err);
        }
      });

      doc.end();
    });
  },

  // Updated function to return URL as a string instead of Readable stream
  getInvoiceFile: async (userId: string, orderId: string): Promise<string> => {
    const invoice = await prisma.invoice.findUnique({
      where: { orderId },
    });

    if (!invoice || !invoice.pdfUrl) {
      throw new Error('Invoice not found or file URL missing');
    }

    const pdfUrl = invoice.pdfUrl;

    // Return the Cloudinary URL (directly)
    return pdfUrl;  // Now returns a string (URL)
  },
};
