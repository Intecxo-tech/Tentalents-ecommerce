import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

export interface OrderItem {
  productId: string;
  name?: string;
  sku?: string;
  quantity: number;
  price: number;
  discount?: number;
  savedForLater?: boolean;
}

export interface PdfOrder {
  id: string;
  userId?: string;
  invoiceNumber?: string;
  userName?: string;
  userEmail?: string;
  userAddress?: string;
  vendorName?: string;
  vendorEmail?: string;
  vendorAddress?: string;
  paymentMethod?: string;
  items: OrderItem[];
  shippingCost?: number;
  status: string;
  createdAt: Date;
}

export class PDFGenerator {
  static async generate(order: PdfOrder): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ size: 'A4', margin: 50 });
        const buffers: Uint8Array[] = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => resolve(Buffer.concat(buffers)));

        // Logo
        const logoPath = path.join(__dirname, 'tentalents-logo.png');
        if (fs.existsSync(logoPath)) doc.image(logoPath, 50, 20, { width: 80 });

        // Header
        doc.font('Helvetica-Bold').fontSize(20).text('Tentalents', 150, 25);
        if (order.invoiceNumber) doc.font('Helvetica').fontSize(12).text(`Invoice #: ${order.invoiceNumber}`, 400, 30);
        doc.font('Helvetica').fontSize(14).text('Invoice', 150, 50);

        // Bill To / Vendor
        doc.moveDown(3);
        const leftX = 50;
        const rightX = 300;

        doc.font('Helvetica-Bold').text('Bill To:', leftX);
        doc.font('Helvetica')
          .text(order.userName ?? 'Customer')
          .text(order.userEmail ?? 'customer@example.com')
          .text(order.userAddress ?? 'Address not provided');

        doc.font('Helvetica-Bold').text('Vendor:', rightX);
        doc.font('Helvetica')
          .text(order.vendorName ?? 'Vendor')
          .text(order.vendorEmail ?? 'vendor@example.com')
          .text(order.vendorAddress ?? 'Address not provided');

        // Order Info
        doc.moveDown(2);
        doc.font('Helvetica-Bold').text('Order Details:', leftX);
        doc.font('Helvetica')
          .text(`Order ID: ${order.id}`)
          .text(`Order Date: ${order.createdAt.toDateString()}`)
          .text(`Payment Method: ${order.paymentMethod ?? 'N/A'}`)
          .text(`Status: ${order.status}`);

        // Items Table
        doc.moveDown(1);
        const tableTop = doc.y + 15;
        const x = { name: 50, sku: 250, qty: 320, price: 370, total: 450, saved: 520 };

        doc.font('Helvetica-Bold').text('Product', x.name, tableTop)
          .text('SKU', x.sku, tableTop)
          .text('Qty', x.qty, tableTop)
          .text('Price', x.price, tableTop)
          .text('Total', x.total, tableTop)
          .text('Saved', x.saved, tableTop);

        let y = tableTop + 25;
        for (const item of order.items) {
          doc.font('Helvetica').text(item.name ?? 'Product', x.name, y)
            .text(item.sku ?? '-', x.sku, y)
            .text(item.quantity.toString(), x.qty, y)
            .text(`₹${item.price}`, x.price, y);

          const totalItem = item.discount ? (item.price - item.discount) * item.quantity : item.price * item.quantity;
          doc.text(`₹${totalItem}`, x.total, y);

          doc.text(item.savedForLater ? 'Yes' : 'No', x.saved, y);

          y += 25;
        }

        // Totals
        const subtotal = order.items.reduce((acc, i) => acc + (i.price - (i.discount || 0)) * i.quantity, 0);
        const gst = +(subtotal * 0.18).toFixed(2);
        const shipping = order.shippingCost ?? 0;
        const grandTotal = subtotal + gst + shipping;

        doc.moveDown(order.items.length * 0.7 + 2);
        doc.font('Helvetica-Bold')
          .text(`Subtotal: ₹${subtotal}`, { align: 'right' })
          .text(`GST (18%): ₹${gst}`, { align: 'right' })
          .text(`Shipping: ₹${shipping}`, { align: 'right' })
          .text(`Grand Total: ₹${grandTotal}`, { align: 'right' });

        // Footer
        doc.rect(0, 750, 595, 50).fill('#FFFFFF').stroke();
        doc.fillColor('#000').fontSize(10)
          .text('Thank you for shopping with Tentalents!', 50, 765, { align: 'center' })
          .text('www.tentalents.com | This is a system-generated invoice', { align: 'center' });

        doc.end();
      } catch (err) {
        reject(err);
      }
    });
  }
}
