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

      // HEADER
      doc.fontSize(22).font('Helvetica-Bold').text('Tentalents', { align: 'center' });
      doc.fontSize(10).text('Empowering E-Commerce Solutions Worldwide', { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(14).font('Helvetica-Bold').text('TAX INVOICE', { align: 'center' });
      doc.moveDown(1);

      // BARCODE
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

      // CUSTOMER / VENDOR INFO
      const colWidth = (contentWidth - 20) / 2;
      const infoBoxHeight = 70;
      const startY = doc.y;

      // Billing
      doc.rect(pageMargin, startY, colWidth, infoBoxHeight).stroke();
      doc.fontSize(10).font('Helvetica-Bold').text('Billing Address:', pageMargin + 5, startY + 5);
      doc.fontSize(9).font('Helvetica').text(`${invoice.customerName}\n${invoice.billingAddress}`, pageMargin + 5, startY + 20, { width: colWidth - 10 });

      // Shipping
      doc.rect(pageMargin + colWidth + 20, startY, colWidth, infoBoxHeight).stroke();
      doc.fontSize(10).font('Helvetica-Bold').text('Shipping Address:', pageMargin + colWidth + 25, startY + 5);
      doc.fontSize(9).font('Helvetica').text(`${invoice.customerName}\n${invoice.shippingAddress}`, pageMargin + colWidth + 25, startY + 20, { width: colWidth - 10 });

      doc.moveDown(5);

      // Vendor Info
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

      // INVOICE META
      doc.fontSize(9).text(`Invoice Date: ${invoice.date}`, pageMargin);
      doc.text(`Order ID: ${invoice.orderId}`, pageMargin);
      doc.moveDown(1);

      // TABLE HEADER
      const tableTop = doc.y + 10;
      const col = {
        desc: pageMargin + 5,
        unit: pageMargin + 250,
        qty: pageMargin + 330,
        tax: pageMargin + 390,
        total: pageMargin + 460,
      };

      doc.fontSize(10).font('Helvetica-Bold');
      doc.rect(pageMargin, tableTop, contentWidth, 20).fill('#f0f0f0').stroke();
      doc.fillColor('black')
        .text('Description', col.desc, tableTop + 5)
        .text('Unit Price', col.unit, tableTop + 5, { width: 60, align: 'right' })
        .text('Qty', col.qty, tableTop + 5, { width: 40, align: 'right' })
        .text('Tax', col.tax, tableTop + 5, { width: 50, align: 'right' })
        .text('Amount', col.total, tableTop + 5, { width: 60, align: 'right' });

      let y = tableTop + 20;
      let grandTotal = 0;

      // TABLE ROWS
      invoice.items.forEach((item, i) => {
        const net = item.unitPrice * item.quantity;
        const taxAmt = (net * item.taxRate) / 100;
        const total = net + taxAmt;
        grandTotal += total;

        if (i % 2 === 0) {
          doc.rect(pageMargin, y, contentWidth, 20).fill('#fafafa').stroke();
        } else {
          doc.rect(pageMargin, y, contentWidth, 20).stroke();
        }

        doc.fillColor('black').fontSize(9).font('Helvetica')
          .text(item.description, col.desc, y + 5, { width: col.unit - col.desc - 5 })
          .text(item.unitPrice.toFixed(2), col.unit, y + 5, { width: 60, align: 'right' })
          .text(item.quantity.toString(), col.qty, y + 5, { width: 40, align: 'right' })
          .text(`${item.taxRate}% (${taxAmt.toFixed(2)})`, col.tax, y + 5, { width: 50, align: 'right' })
          .text(total.toFixed(2), col.total, y + 5, { width: 60, align: 'right' });

        y += 20;
      });

      // TOTALS SECTION
      y += 5;
      doc.moveTo(pageMargin, y).lineTo(pageMargin + contentWidth, y).stroke();
      y += 5;
      doc.fontSize(10).font('Helvetica-Bold')
        .text('Grand Total:', col.tax, y)
        .text(grandTotal.toFixed(2), col.total, y, { width: 60, align: 'right' });

      const amountWords = toWords(Math.floor(grandTotal)).replace(/^\w/, c => c.toUpperCase());
      doc.moveDown(2)
        .fontSize(10)
        .font('Helvetica-Bold')
        .text(`Amount in words: ${amountWords} only`, pageMargin, doc.y, {
          width: contentWidth,
          align: 'center'
        });

      // THANK YOU NOTE AT BOTTOM
      const bottomY = doc.page.height - doc.page.margins.bottom - 20;
      doc.fontSize(11)
        .font('Helvetica-Oblique')
        .text('✨ Thank you for your purchase! We appreciate your business. ✨',
              pageMargin, bottomY, {
                width: contentWidth,
                align: 'center'
              });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
