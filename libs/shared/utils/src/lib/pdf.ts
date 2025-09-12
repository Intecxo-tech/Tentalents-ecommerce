import PDFDocument from 'pdfkit';
import bwipjs from 'bwip-js';
import { toWords } from 'number-to-words';

export interface InvoiceItem {
  description: string;
  unitPrice: number;
  quantity: number;
  taxRate: number; // in %
}

export interface InvoiceData {
  orderId: string;
  customerName: string;
  customerEmail: string;
  billingAddress: string;
  shippingAddress: string;
  gstNumber: string;
  panNumber: string;
  vendorName?: string;
  items: InvoiceItem[];
  date: string;
}

export async function generateInvoicePDFBuffer(invoice: InvoiceData): Promise<Buffer> {
  return new Promise<Buffer>(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 40 });
      const buffers: Buffer[] = [];
      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      // ---- HEADER ----
      doc.fontSize(20).font('Helvetica-Bold').text('Tentalents', { align: 'left' });
      doc.fontSize(10).font('Helvetica').text('Empowering E-Commerce Solutions Worldwide', { align: 'left' });
      doc.fontSize(14).font('Helvetica-Bold').text('TAX INVOICE / BILL OF SUPPLY / CASH MEMO', { align: 'right' });

      // ---- BARCODE ----
      try {
        const barcodePng = await bwipjs.toBuffer({
          bcid: 'code128',
          text: invoice.orderId,
          scale: 3,
          height: 10,
          includetext: true,
          textxalign: 'center',
        });
        doc.image(barcodePng, 400, 80, { width: 150 });
      } catch (err) {
        console.warn('⚠️ Barcode generation failed:', err);
      }

      doc.moveDown(3);

      // ---- ADDRESSES ----
      doc.fontSize(12).font('Helvetica-Bold').text('Billing Address:');
      doc.fontSize(10).font('Helvetica').text(`${invoice.customerName}\n${invoice.billingAddress}`);

      doc.moveDown();
      doc.fontSize(12).font('Helvetica-Bold').text('Shipping Address:');
      doc.fontSize(10).font('Helvetica').text(`${invoice.customerName}\n${invoice.shippingAddress}`);

      if (invoice.vendorName) {
        doc.moveDown();
        doc.fontSize(12).font('Helvetica-Bold').text('Vendor:');
        doc.fontSize(10).font('Helvetica').text(invoice.vendorName);
      }

      doc.moveDown();
      doc.text(`GSTIN: ${invoice.gstNumber}`);
      doc.text(`PAN: ${invoice.panNumber}`);
      doc.text(`Invoice Date: ${invoice.date}`);
      doc.text(`Order ID: ${invoice.orderId}`);

      doc.moveDown(2);

      // ---- TABLE HEADER ----
      const tableTop = doc.y;
      const colWidths = [40, 180, 80, 60, 60, 60, 60];
      const headers = ['Sl.No', 'Description', 'Unit Price', 'Qty', 'Net Amt', 'Tax', 'Total'];

      headers.forEach((h, i) => {
        doc.font('Helvetica-Bold').fontSize(10).text(h, 50 + i * 70, tableTop, { width: colWidths[i], align: 'left' });
      });

      // ---- TABLE ROWS ----
      let position = tableTop + 20;
      let totalAmount = 0;

      invoice.items.forEach((item, index) => {
        const netAmount = item.unitPrice * item.quantity;
        const taxAmount = (netAmount * item.taxRate) / 100;
        const total = netAmount + taxAmount;
        totalAmount += total;

        const row = [
          (index + 1).toString(),
          item.description,
          item.unitPrice.toFixed(2),
          item.quantity.toString(),
          netAmount.toFixed(2),
          `${item.taxRate}% (${taxAmount.toFixed(2)})`,
          total.toFixed(2),
        ];

        row.forEach((text, i) => {
          doc.font('Helvetica').fontSize(10).text(text, 50 + i * 70, position, { width: colWidths[i] });
        });

        position += 20;
      });

      // ---- TOTAL ----
      doc.moveTo(50, position + 10).lineTo(550, position + 10).stroke();
      doc.font('Helvetica-Bold').text('Grand Total:', 370, position + 20);
      doc.text(totalAmount.toFixed(2), 470, position + 20);

      // ---- AMOUNT IN WORDS ----
      const amountInWords = toWords(Math.floor(totalAmount));
      doc.moveDown(2)
        .font('Helvetica-Oblique')
        .fontSize(10)
        .text(`Amount in words: ${amountInWords.charAt(0).toUpperCase() + amountInWords.slice(1)} only`);

      // ---- FOOTER ----
      doc.moveDown(2).fontSize(9).text(
        'This is a computer-generated invoice and does not require a physical signature.',
        { align: 'center' }
      );

      // ---- THANK YOU NOTE ----
      doc.moveDown(2).fontSize(12).font('Helvetica-Bold').text(
        '🙏 Thank you for choosing Tentalents. We appreciate your business!',
        { align: 'center' }
      );

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
