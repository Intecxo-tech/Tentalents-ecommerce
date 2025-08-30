// libs/shared/utils/src/lib/pdf.ts
import PDFDocument from 'pdfkit';

// Inline types (no external import needed)
interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

export class PDFGenerator {
  static async generate(order: Order, type: 'user' | 'vendor' = 'user'): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ size: 'A4', margin: 50 });
        const buffers: Uint8Array[] = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => resolve(Buffer.concat(buffers)));

        // ---------------- Header ----------------
        const headerHeight = 80;
        doc.rect(0, 0, 595, headerHeight).fill('#1a73e8');
        doc.fillColor('#ffffff').fontSize(24).text('Tentalents', 50, 25, { align: 'left' });
        doc.fontSize(14).text(type === 'user' ? 'Customer Invoice' : 'Vendor Invoice', 50, 50, { align: 'left' });

        doc.fillColor('#000').moveDown(3);

        // ---------------- Order Info ----------------
        doc.fontSize(10);
        doc.text(`Order ID: ${order.id}`);
        doc.text(`User ID: ${order.userId}`);
        doc.text(`Status: ${order.status}`);
        doc.text(`Total Amount: ₹${order.totalAmount}`);
        doc.text(`Created At: ${order.createdAt.toDateString()}`);
        doc.moveDown(1);

        // ---------------- Items Table ----------------
        const tableTop = doc.y + 20;
        const itemX = 50;
        const qtyX = 300;
        const priceX = 370;
        const totalX = 450;

        // Table Header
        doc.rect(itemX - 5, tableTop - 5, 500, 20).fill('#f2f2f2').stroke();
        doc.fillColor('#000').font('Helvetica-Bold').text('Product ID', itemX, tableTop);
        doc.text('Qty', qtyX, tableTop);
        doc.text('Price', priceX, tableTop);
        doc.text('Total', totalX, tableTop);

        // Table Rows
        doc.font('Helvetica');
        order.items.forEach((item: OrderItem, i: number) => {
          const y = tableTop + 25 + i * 25;
          if (i % 2 === 0) {
            doc.rect(itemX - 5, y - 5, 500, 25).fill('#f9f9f9').stroke();
          }
          doc.fillColor('#000');
          doc.text(item.productId, itemX, y);
          doc.text(item.quantity.toString(), qtyX, y);
          doc.text(`₹${item.price}`, priceX, y);
          doc.text(`₹${item.price * item.quantity}`, totalX, y);
        });

        // ---------------- Totals ----------------
        const subtotal = order.items.reduce((acc: number, item: OrderItem) => acc + item.price * item.quantity, 0);
        const tax = +(subtotal * 0.18).toFixed(2);
        const grandTotal = subtotal + tax;

        doc.moveDown(order.items.length * 0.7 + 2);
        doc.font('Helvetica-Bold');
        doc.text(`Subtotal: ₹${subtotal}`, { align: 'right' });
        doc.text(`GST (18%): ₹${tax}`, { align: 'right' });
        doc.text(`Grand Total: ₹${grandTotal}`, { align: 'right' });

        // ---------------- Footer ----------------
        doc.rect(0, 750, 595, 50).fill('#1a73e8');
        doc.fillColor('#fff').fontSize(10).text('Thank you for shopping with Tentalents!', 50, 765, { align: 'center' });
        doc.text('This is a system-generated invoice.', { align: 'center' });

        doc.end();
      } catch (err) {
        reject(err);
      }
    });
  }
}
