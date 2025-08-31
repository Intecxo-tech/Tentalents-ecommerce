import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

interface OrderItem {
  productId: string;
  name: string;
  sku: string;
  quantity: number;
  price: number;
  discount?: number;
}

interface Order {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userAddress: string;
  vendorName: string;
  vendorEmail: string;
  vendorAddress: string;
  paymentMethod: string;
  items: OrderItem[];
  shippingCost: number;
  totalAmount: number;
  status: string;
  createdAt: Date;
}

export class PDFGenerator {
  static async generate(order: Order, type: 'user' | 'vendor' = 'user'): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ size: 'A4', margin: 50 });
        const buffers: Uint8Array[] = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => resolve(Buffer.concat(buffers)));

        const logoPath = path.join(__dirname, 'tentalents-logo.png');
        if (fs.existsSync(logoPath)) {
          doc.image(logoPath, 50, 15, { width: 50 });
        }

        // Header
        doc.fillColor('#1a73e8')
          .fontSize(22)
          .font('Helvetica-Bold')
          .text('Tentalents', 110, 25)
          .fontSize(14)
          .text(type === 'user' ? 'Customer Invoice' : 'Vendor Invoice', 110, 50);

        doc.moveDown(3);

        // Bill To & Vendor
        doc.fontSize(10).font('Helvetica-Bold').text('Bill To:', 50);
        doc.font('Helvetica')
          .text(order.userName)
          .text(order.userEmail)
          .text(order.userAddress);

        doc.font('Helvetica-Bold').text('Vendor:', 300, 110);
        doc.font('Helvetica')
          .text(order.vendorName, 300, 125)
          .text(order.vendorEmail)
          .text(order.vendorAddress);

        doc.moveDown(2);

        // Order Info
        doc.font('Helvetica-Bold').text('Order Details:', 50);
        doc.font('Helvetica')
          .text(`Order ID: ${order.id}`)
          .text(`Order Date: ${order.createdAt.toDateString()}`)
          .text(`Payment Method: ${order.paymentMethod}`)
          .text(`Status: ${order.status}`);

        doc.moveDown(1);

        // Items Table
        const tableTop = doc.y + 20;
        const xPositions = { name: 100, sku: 250, qty: 320, price: 370, total: 450 };

        // Table Header
        doc.rect(45, tableTop - 5, 500, 20).fill('#f2f2f2').stroke();
        doc.fillColor('#000').font('Helvetica-Bold')
          .text('Product', xPositions.name, tableTop)
          .text('SKU', xPositions.sku, tableTop)
          .text('Qty', xPositions.qty, tableTop)
          .text('Price', xPositions.price, tableTop)
          .text('Total', xPositions.total, tableTop);

        // Table Rows
        let y = tableTop + 25;
        for (const item of order.items) {
          if (y % 2 === 0) doc.rect(45, y - 5, 500, 25).fill('#f9f9f9').stroke();
          doc.fillColor('#000').font('Helvetica');

          doc.text(item.name, xPositions.name, y);
          doc.text(item.sku, xPositions.sku, y);
          doc.text(item.quantity.toString(), xPositions.qty, y);
          doc.text(`₹${item.price}`, xPositions.price, y);

          const totalItem = item.discount ? (item.price - item.discount) * item.quantity : item.price * item.quantity;
          doc.text(`₹${totalItem}`, xPositions.total, y);

          y += 25;
        }

        // Totals
        const subtotal = order.items.reduce((acc, i) => acc + (i.price - (i.discount || 0)) * i.quantity, 0);
        const gst = +(subtotal * 0.18).toFixed(2);
        const grandTotal = subtotal + gst + order.shippingCost;

        doc.moveDown(order.items.length * 0.7 + 2);
        doc.font('Helvetica-Bold');
        doc.text(`Subtotal: ₹${subtotal}`, { align: 'right' });
        doc.text(`GST (18%): ₹${gst}`, { align: 'right' });
        doc.text(`Shipping: ₹${order.shippingCost}`, { align: 'right' });
        doc.text(`Grand Total: ₹${grandTotal}`, { align: 'right' });

        // Footer
        doc.rect(0, 750, 595, 50).fill('#1a73e8');
        doc.fillColor('#fff').fontSize(10)
          .text('Thank you for shopping with Tentalents!', 50, 765, { align: 'center' })
          .text('www.tentalents.com | Invoice is system-generated', { align: 'center' });

        doc.end();
      } catch (err) {
        reject(err);
      }
    });
  }
}
