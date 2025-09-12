import PDFDocument from 'pdfkit';
import bwipjs from 'bwip-js';
import { toWords } from 'number-to-words';

export interface InvoiceItem {
  description: string;
  unitPrice: number;
  quantity: number;
  taxRate: number; // %
}

export interface InvoiceData {
  orderId: string;
  customerName: string;
  customerEmail: string;
  billingAddress: string;
  shippingAddress: string;
  shippingName?: string;
  gstNumber: string;
  panNumber: string;
  vendorName?: string;
  vendorAddress?: string;
  items: InvoiceItem[];
  date: string;
}

export async function generateInvoicePDFBuffer(invoice: InvoiceData): Promise<Buffer> {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const buffers: Buffer[] = [];
      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      // ---- HEADER ----
      const generateHeader = () => {
        doc.fontSize(20).font('Helvetica-Bold').text('Tentalents', { align: 'left' });
        doc.fontSize(10).font('Helvetica').text('Empowering E-Commerce Solutions Worldwide', { align: 'left' });
        doc.moveDown(0.5);
        doc.fontSize(14).font('Helvetica-Bold')
          .text('TAX INVOICE / BILL OF SUPPLY / CASH MEMO', { align: 'center' });

        // Barcode
        bwipjs.toBuffer({
          bcid: 'code128',
          text: invoice.orderId,
          scale: 3,
          height: 10,
          includetext: true,
          textxalign: 'center',
        }).then((barcodePng) => {
          doc.image(barcodePng, doc.page.width - 180, 50, { width: 150 });
        }).catch((err) => console.warn('⚠️ Barcode generation failed:', err));
      };

      const generateTableHeader = (y: number) => {
        const col = {
          sl: 50,
          desc: 90,
          unit: 350,
          qty: 400,
          net: 440,
          tax: 480,
          total: 530
        };
        doc.font('Helvetica-Bold').fontSize(10)
          .text('Sl.No', col.sl, y)
          .text('Description', col.desc, y)
          .text('Unit Price', col.unit, y, { width: 50, align: 'right' })
          .text('Qty', col.qty, y, { width: 30, align: 'right' })
          .text('Net Amt', col.net, y, { width: 40, align: 'right' })
          .text('Tax', col.tax, y, { width: 50, align: 'right' })
          .text('Total', col.total, y, { width: 60, align: 'right' });

        doc.moveTo(50, y + 15).lineTo(doc.page.width - 50, y + 15).stroke();
      };

      generateHeader();
      doc.moveDown(5);

      // ---- CUSTOMER ADDRESSES ----
      const addressWidth = 250;
      doc.fontSize(12).font('Helvetica-Bold').text('Billing Address:');
      doc.fontSize(10).text(`${invoice.customerName}\n${invoice.billingAddress}`, { width: addressWidth });
      doc.moveDown();
      doc.fontSize(12).font('Helvetica-Bold').text('Shipping Address:');
      doc.fontSize(10).text(`${invoice.shippingName || invoice.customerName}\n${invoice.shippingAddress}`, { width: addressWidth });

      // ---- VENDOR INFO ----
      if (invoice.vendorName || invoice.vendorAddress || invoice.gstNumber || invoice.panNumber) {
        doc.moveDown();
        doc.fontSize(12).font('Helvetica-Bold').text('Sold By / Vendor Information:');
        if (invoice.vendorName) doc.fontSize(10).text(`Name: ${invoice.vendorName}`);
        if (invoice.vendorAddress) doc.text(`Address: ${invoice.vendorAddress}`, { width: addressWidth });
        if (invoice.gstNumber) doc.text(`GSTIN: ${invoice.gstNumber}`);
        if (invoice.panNumber) doc.text(`PAN: ${invoice.panNumber}`);
      }

      // ---- INVOICE META ----
      doc.moveDown();
      doc.fontSize(10).text(`Invoice Date: ${invoice.date}`);
      doc.text(`Order ID: ${invoice.orderId}`);
      doc.moveDown(1);

      // ---- TABLE ROWS ----
      let y = doc.y + 20;
      generateTableHeader(y);
      y += 25;
      let totalAmount = 0;

      invoice.items.forEach((item, index) => {
        const rowHeight = 20;
        const maxY = 750;

        if (y + rowHeight > maxY) {
          doc.addPage();
          y = 50;
          generateTableHeader(y);
          y += 25;
        }

        const net = item.unitPrice * item.quantity;
        const taxAmt = (net * item.taxRate) / 100;
        const total = net + taxAmt;
        totalAmount += total;

        const col = {
          sl: 50,
          desc: 90,
          unit: 350,
          qty: 400,
          net: 440,
          tax: 480,
          total: 530
        };

        doc.font('Helvetica').fontSize(10)
          .text((index + 1).toString(), col.sl, y)
          .text(item.description, col.desc, y, { width: 250 })
          .text(item.unitPrice.toFixed(2), col.unit, y, { width: 50, align: 'right' })
          .text(item.quantity.toString(), col.qty, y, { width: 30, align: 'right' })
          .text(net.toFixed(2), col.net, y, { width: 40, align: 'right' })
          .text(`${item.taxRate}% (${taxAmt.toFixed(2)})`, col.tax, y, { width: 50, align: 'right' })
          .text(total.toFixed(2), col.total, y, { width: 60, align: 'right' });

        y += rowHeight;
      });

      // ---- GRAND TOTAL ----
      doc.moveTo(50, y + 5).lineTo(doc.page.width - 50, y + 5).stroke();
      const col = { total: 530 };
      doc.font('Helvetica-Bold').fontSize(12)
        .text('Grand Total:', col.total - 90, y + 15)
        .text(totalAmount.toFixed(2), col.total, y + 15, { width: 60, align: 'right' });

      // ---- AMOUNT IN WORDS ----
      const amountWords = toWords(Math.floor(totalAmount)).replace(/^\w/, (c) => c.toUpperCase());
      doc.moveDown(2).font('Helvetica-Bold').fontSize(10)
        .text(`Amount in words: ${amountWords} only`, { align: 'center' });

      // ---- FOOTER ----
      doc.moveDown(2).fontSize(10).font('Helvetica-Oblique')
        .text(
          'This is a computer-generated invoice and does not require a physical signature.\n\nThank you for choosing Tentalents. We appreciate your business!',
          { align: 'center' }
        );

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
