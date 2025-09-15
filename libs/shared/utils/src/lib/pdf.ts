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
  orderId: string;
  customerName: string;
  customerEmail: string;
  billingAddress: string;
  shippingAddress: string;
  vendorName?: string;
  vendorAddress?: string;
  gstNumber?: string;
  panNumber?: string;
  items: InvoiceItem[];
  date: string;
}

export async function generateInvoicePDFBuffer(invoice: InvoiceData): Promise<Buffer> {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const buffers: Buffer[] = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      const pageWidth = doc.page.width;
      const pageMargin = doc.page.margins.left;
      const contentWidth = pageWidth - pageMargin * 2;

      // ---- HEADER ----
      doc.fontSize(22).font('Helvetica-Bold').text('Tentalents', { align: 'center' });
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
        doc.image(barcodePng, pageWidth - pageMargin - 150, doc.y, { width: 150, height: 50 });
      } catch (err) {
        console.warn('⚠️ Barcode generation failed:', err);
      }

      doc.moveDown(3);

      // ---- CUSTOMER & VENDOR INFO DYNAMICALLY ----
      const colWidth = (contentWidth - 20) / 2;
      const infoBoxHeight = 70;
      const startY = doc.y;

      // Billing Box
      doc.rect(pageMargin, startY, colWidth, infoBoxHeight).stroke();
      doc.fontSize(10).font('Helvetica-Bold').text('Billing Address:', pageMargin + 5, startY + 5);
      doc.fontSize(9).font('Helvetica').text(`${invoice.customerName}\n${invoice.billingAddress}`, pageMargin + 5, startY + 20, { width: colWidth - 10 });

      // Shipping Box
      doc.rect(pageMargin + colWidth + 20, startY, colWidth, infoBoxHeight).stroke();
      doc.fontSize(10).font('Helvetica-Bold').text('Shipping Address:', pageMargin + colWidth + 25, startY + 5);
      doc.fontSize(9).font('Helvetica').text(`${invoice.customerName}\n${invoice.shippingAddress}`, pageMargin + colWidth + 25, startY + 20, { width: colWidth - 10 });

      doc.moveDown(5);

      // Vendor Info Box (render only if vendor exists)
      if (invoice.vendorName || invoice.vendorAddress || invoice.gstNumber || invoice.panNumber) {
        const vendorBoxY = doc.y;
        doc.rect(pageMargin, vendorBoxY, contentWidth, infoBoxHeight / 1.2).stroke();
        doc.fontSize(10).font('Helvetica-Bold').text('Vendor Information:', pageMargin + 5, vendorBoxY + 5);
        let offsetY = vendorBoxY + 20;
        if (invoice.vendorName) { doc.fontSize(9).text(`Name: ${invoice.vendorName}`, pageMargin + 5, offsetY); offsetY += 12; }
        if (invoice.vendorAddress) { doc.text(`Address: ${invoice.vendorAddress}`, pageMargin + 5, offsetY, { width: contentWidth - 10 }); offsetY += 12; }
        if (invoice.gstNumber) { doc.text(`GSTIN: ${invoice.gstNumber}`, pageMargin + 5, offsetY); offsetY += 12; }
        if (invoice.panNumber) { doc.text(`PAN: ${invoice.panNumber}`, pageMargin + 5, offsetY); }
        doc.moveDown(3);
      }

      // ---- INVOICE META ----
      doc.fontSize(9).text(`Invoice Date: ${invoice.date}`, pageMargin);
      doc.text(`Order ID: ${invoice.orderId}`, pageMargin);
      doc.moveDown(1);

      // ---- TABLE & TOTALS ----
      const tableX = pageMargin;
      const col = {
        sl: tableX,
        desc: tableX + 40,
        unit: tableX + 300,
        qty: tableX + 370,
        net: tableX + 420,
        tax: tableX + 470,
        total: tableX + 520
      };

      // Table Header
      doc.fontSize(10).font('Helvetica-Bold')
        .text('Sl.', col.sl)
        .text('Description', col.desc)
        .text('Unit', col.unit, doc.y, { width: 60, align: 'right' })
        .text('Qty', col.qty, doc.y, { width: 40, align: 'right' })
        .text('Net', col.net, doc.y, { width: 50, align: 'right' })
        .text('Tax', col.tax, doc.y, { width: 50, align: 'right' })
        .text('Total', col.total, doc.y, { width: 60, align: 'right' });

      doc.moveTo(tableX, doc.y + 5).lineTo(pageWidth - pageMargin, doc.y + 5).stroke();

      let y = doc.y + 10;
      let grandTotal = 0;

      for (let i = 0; i < invoice.items.length; i++) {
        const item = invoice.items[i];
        const net = item.unitPrice * item.quantity;
        const taxAmt = (net * item.taxRate) / 100;
        const total = net + taxAmt;
        grandTotal += total;

        if (y > doc.page.height - 100) {
          doc.addPage();
          y = pageMargin;
        }

        if (i % 2 === 0) {
          doc.rect(tableX, y - 2, contentWidth, 20).fillOpacity(0.05).fillAndStroke('grey', 'grey');
          doc.fillOpacity(1);
        }

        doc.fontSize(10).font('Helvetica').fillColor('black')
          .text((i + 1).toString(), col.sl, y)
          .text(item.description, col.desc, y, { width: col.unit - col.desc - 5 })
          .text(item.unitPrice.toFixed(2), col.unit, y, { width: 60, align: 'right' })
          .text(item.quantity.toString(), col.qty, y, { width: 40, align: 'right' })
          .text(net.toFixed(2), col.net, y, { width: 50, align: 'right' })
          .text(`${item.taxRate}% (${taxAmt.toFixed(2)})`, col.tax, y, { width: 50, align: 'right' })
          .text(total.toFixed(2), col.total, y, { width: 60, align: 'right' });

        y += 20;
      }

      // Grand Total
      doc.moveTo(tableX, y).lineTo(pageWidth - pageMargin, y).stroke();
      y += 5;
      doc.fontSize(12).font('Helvetica-Bold')
        .text('Grand Total:', col.net, y)
        .text(grandTotal.toFixed(2), col.total, y, { width: 60, align: 'right' });

      const amountWords = toWords(Math.floor(grandTotal)).replace(/^\w/, (c) => c.toUpperCase());
      doc.moveDown(2).fontSize(10).font('Helvetica-Bold')
        .text(`Amount in words: ${amountWords} only`, { align: 'center' });

      doc.moveDown(2).fontSize(10).font('Helvetica-Oblique')
        .text('This is a computer-generated invoice. Thank you for choosing Tentalents!', { align: 'center' });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
