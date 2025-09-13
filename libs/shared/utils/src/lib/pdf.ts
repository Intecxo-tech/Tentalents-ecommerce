import PDFDocument from 'pdfkit';
import bwipjs from 'bwip-js';
import { toWords } from 'number-to-words';

export interface InvoiceItem {
  description: string;
  unitPrice: number;
  quantity: number;
  taxRate: number;
}

export interface InvoiceData {
  invoiceNumber: string; // required unique invoice number
  orderId: string;
  customerName: string;
  customerEmail: string;
  billingAddress: string;
  shippingAddress: string;
  vendorName?: string;
  vendorAddress?: string;
  gstNumber: string;
  panNumber: string;
  items: InvoiceItem[];
  date: string;
  logoUrl?: string; // optional company logo
}

export async function generateInvoicePDFBuffer(invoice: InvoiceData): Promise<Buffer> {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const buffers: Buffer[] = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      // ---- HEADER ----
      if (invoice.logoUrl) {
        try {
          const arrayBuffer = await fetch(invoice.logoUrl).then(res => res.arrayBuffer());
          const logoBuffer = Buffer.from(arrayBuffer); // convert ArrayBuffer to Buffer
          doc.image(logoBuffer, 50, 45, { width: 100 });
        } catch {
          console.warn('⚠️ Logo fetch failed');
        }
      }

      doc.fontSize(22).font('Helvetica-Bold').text('Tentalents', 0, 50, { align: 'center' });
      doc.fontSize(10).text('Empowering E-Commerce Solutions Worldwide', { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(14).font('Helvetica-Bold')
        .text('TAX INVOICE / BILL OF SUPPLY / CASH MEMO', { align: 'center' });
      doc.moveDown(1);

      // ---- BARCODE ----
      try {
        const barcodePng = await bwipjs.toBuffer({
          bcid: 'code128',
          text: invoice.orderId,
          scale: 3,
          height: 40,
          includetext: true,
          textxalign: 'center',
        });
        doc.image(barcodePng, doc.page.width - 180, 50, { width: 150, height: 50 });
      } catch (err) {
        console.warn('⚠️ Barcode generation failed:', err);
      }

      // ---- CUSTOMER & VENDOR INFO ----
      const colWidth = 250;
      doc.fontSize(12).font('Helvetica-Bold').text('Billing Address:', 50, 150);
      doc.fontSize(10).font('Helvetica')
        .text(`${invoice.customerName}\n${invoice.billingAddress}`, 50, doc.y, { width: colWidth });
      doc.moveDown(0.5);

      doc.fontSize(12).font('Helvetica-Bold').text('Shipping Address:', 350, 150);
      doc.fontSize(10).font('Helvetica')
        .text(`${invoice.customerName}\n${invoice.shippingAddress}`, 350, doc.y, { width: colWidth });
      doc.moveDown(1);

      if (invoice.vendorName || invoice.vendorAddress || invoice.gstNumber || invoice.panNumber) {
        doc.fontSize(12).font('Helvetica-Bold').text('Vendor Information:', 50);
        if (invoice.vendorName) doc.fontSize(10).text(`Name: ${invoice.vendorName}`);
        if (invoice.vendorAddress) doc.text(`Address: ${invoice.vendorAddress}`, { width: colWidth });
        if (invoice.gstNumber) doc.text(`GSTIN: ${invoice.gstNumber}`);
        if (invoice.panNumber) doc.text(`PAN: ${invoice.panNumber}`);
        doc.moveDown(1);
      }

      // ---- INVOICE META ----
      doc.fontSize(10).text(`Invoice Number: ${invoice.invoiceNumber}`, 50);
      doc.text(`Invoice Date: ${invoice.date}`);
      doc.text(`Order ID: ${invoice.orderId}`);
      doc.moveDown(1);

      // ---- TABLE HEADER ----
      const tableTop = doc.y;
      const itemCol = { sl: 50, desc: 90, unit: 350, qty: 420, net: 460, tax: 500, total: 550 };
      doc.fontSize(10).font('Helvetica-Bold')
        .text('Sl.No', itemCol.sl, tableTop)
        .text('Description', itemCol.desc, tableTop)
        .text('Unit Price', itemCol.unit, tableTop, { width: 50, align: 'right' })
        .text('Qty', itemCol.qty, tableTop, { width: 30, align: 'right' })
        .text('Net Amt', itemCol.net, tableTop, { width: 40, align: 'right' })
        .text('Tax', itemCol.tax, tableTop, { width: 50, align: 'right' })
        .text('Total', itemCol.total, tableTop, { width: 60, align: 'right' });

      doc.moveTo(50, tableTop + 15).lineTo(doc.page.width - 50, tableTop + 15).stroke();

      // ---- TABLE ROWS ----
      let y = tableTop + 25;
      let grandTotal = 0;
      invoice.items.forEach((item, i) => {
        const net = item.unitPrice * item.quantity;
        const taxAmt = (net * item.taxRate) / 100;
        const total = net + taxAmt;
        grandTotal += total;

        if (y + 20 > 750) { doc.addPage(); y = 50; }

        // Alternating row colors
        if (i % 2 === 0) {
          doc.rect(50, y - 2, doc.page.width - 100, 20).fillOpacity(0.1).fillAndStroke('#f2f2f2', '#f2f2f2');
          doc.fillColor('black');
        }

        doc.fontSize(10).font('Helvetica')
          .text((i + 1).toString(), itemCol.sl, y)
          .text(item.description, itemCol.desc, y, { width: 250 })
          .text(item.unitPrice.toFixed(2), itemCol.unit, y, { width: 50, align: 'right' })
          .text(item.quantity.toString(), itemCol.qty, y, { width: 30, align: 'right' })
          .text(net.toFixed(2), itemCol.net, y, { width: 40, align: 'right' })
          .text(`${item.taxRate}% (${taxAmt.toFixed(2)})`, itemCol.tax, y, { width: 50, align: 'right' })
          .text(total.toFixed(2), itemCol.total, y, { width: 60, align: 'right' });

        y += 20;
      });

      // ---- GRAND TOTAL ----
      const subtotal = invoice.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
      const totalTax = grandTotal - subtotal;

      doc.moveTo(50, y + 5).lineTo(doc.page.width - 50, y + 5).stroke();
      doc.fontSize(10).font('Helvetica-Bold')
        .text('Subtotal:', 460, y + 15)
        .text(subtotal.toFixed(2), 550, y + 15, { width: 60, align: 'right' });
      doc.text('Total Tax:', 460, y + 30)
        .text(totalTax.toFixed(2), 550, y + 30, { width: 60, align: 'right' });
      doc.fontSize(12).font('Helvetica-Bold')
        .text('Grand Total:', 460, y + 50)
        .text(grandTotal.toFixed(2), 550, y + 50, { width: 60, align: 'right' });

      // ---- AMOUNT IN WORDS ----
      const amountWords = toWords(Math.floor(grandTotal)).replace(/^\w/, (c) => c.toUpperCase());
      doc.moveDown(2).fontSize(10).font('Helvetica-Bold')
        .text(`Amount in words: ${amountWords} only`, { align: 'center' });

      // ---- FOOTER ----
      const footerY = doc.page.height - 50;
      doc.fontSize(10).font('Helvetica-Oblique')
        .text('Thank you for choosing Tentalents! We appreciate your business.', 0, footerY, { align: 'center' });

      // ---- PAGE NUMBER ----
      let pageNumber = 1;
      doc.fontSize(8).text(`Page ${pageNumber}`, 50, doc.page.height - 30, { align: 'center' });

      doc.on('pageAdded', () => {
        pageNumber++;
        doc.fontSize(8).text(`Page ${pageNumber}`, 50, doc.page.height - 30, { align: 'center' });
      });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
