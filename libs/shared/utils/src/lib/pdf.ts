import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

// PDF-friendly order item type
export interface OrderItem {
  productId: string;
  name?: string;
  sku?: string;
  quantity: number;
  price: number;
  discount?: number;
}

// PDF-friendly order type
export interface PdfOrder {
  id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  userAddress?: string;
  vendorName?: string;
  vendorEmail?: string;
  vendorAddress?: string;
  paymentMethod?: string;
  items: OrderItem[];
  shippingCost?: number;
  totalAmount: number;
  status: string;
  createdAt: Date;
  invoiceNumber?: string;
}

export class PDFGenerator {
  static async generate(order: PdfOrder, type: 'user' | 'vendor' = 'user'): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ size: 'A4', margin: 50 });
        const buffers: Uint8Array[] = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => resolve(Buffer.concat(buffers)));

        // Logo
        const logoPath = path.join(__dirname, 'tentalents-logo.png');
        if (fs.existsSync(logoPath)) doc.image(logoPath, 50, 15, { width: 50 });

        // Header
        doc.fillColor('#000000') // black text
          .fontSize(22)
          .font('Helvetica-Bold')
          .text('Tentalents', 110, 25)
          .fontSize(14)
          .text(type === 'user' ? 'Customer Invoice' : 'Vendor Invoice', 110, 50);

        doc.moveDown(3);

        // Bill To & Vendor
        doc.fontSize(10).font('Helvetica-Bold').text('Bill To:', 50);
        doc.font('Helvetica')
          .text(order.userName ?? 'Customer')
          .text(order.userEmail ?? 'customer@example.com')
          .text(order.userAddress ?? 'Address not provided');

        doc.font('Helvetica-Bold').text('Vendor:', 300, 110);
        doc.font('Helvetica')
          .text(order.vendorName ?? 'Vendor', 300, 125)
          .text(order.vendorEmail ?? 'vendor@example.com')
          .text(order.vendorAddress ?? 'Address not provided');

        doc.moveDown(2);

        // Order Info
        doc.font('Helvetica-Bold').text('Order Details:', 50);
        doc.font('Helvetica')
          .text(`Order ID: ${order.id}`)
          .text(`Order Date: ${order.createdAt.toDateString()}`)
          .text(`Payment Method: ${order.paymentMethod ?? 'N/A'}`)
          .text(`Status: ${order.status}`);

        doc.moveDown(1);

        // Items Table
        const tableTop = doc.y + 20;
        const xPositions = { name: 100, sku: 250, qty: 320, price: 370, total: 450 };

        // Table Header (all black text)
        doc.rect(45, tableTop - 5, 500, 20).fill('#FFFFFF').stroke(); // white background
        doc.fillColor('#000000').font('Helvetica-Bold')
          .text('Product', xPositions.name, tableTop)
          .text('SKU', xPositions.sku, tableTop)
          .text('Qty', xPositions.qty, tableTop)
          .text('Price', xPositions.price, tableTop)
          .text('Total', xPositions.total, tableTop);

        // Table Rows
        let y = tableTop + 25;
        for (const item of order.items) {
          doc.fillColor('#000000').font('Helvetica');
          doc.text(item.name ?? 'Product', xPositions.name, y);
          doc.text(item.sku ?? 'SKU', xPositions.sku, y);
          doc.text(item.quantity.toString(), xPositions.qty, y);
          doc.text(`₹${item.price}`, xPositions.price, y);

          const totalItem = item.discount ? (item.price - item.discount) * item.quantity : item.price * item.quantity;
          doc.text(`₹${totalItem}`, xPositions.total, y);

          y += 25;
        }

        // Totals
        const subtotal = order.items.reduce((acc, i) => acc + (i.price - (i.discount || 0)) * i.quantity, 0);
        const gst = +(subtotal * 0.18).toFixed(2);
        const shipping = order.shippingCost ?? 0;
        const grandTotal = subtotal + gst + shipping;

        doc.moveDown(order.items.length * 0.7 + 2);
        doc.font('Helvetica-Bold');
        doc.text(`Subtotal: ₹${subtotal}`, { align: 'right' });
        doc.text(`GST (18%): ₹${gst}`, { align: 'right' });
        doc.text(`Shipping: ₹${shipping}`, { align: 'right' });
        doc.text(`Grand Total: ₹${grandTotal}`, { align: 'right' });

        // Footer
        doc.rect(0, 750, 595, 50).fill('#FFFFFF').stroke(); // white background
        doc.fillColor('#000000').fontSize(10)
          .text('Thank you for shopping with Tentalents!', 50, 765, { align: 'center' })
          .text('www.tentalents.com | Invoice is system-generated', { align: 'center' });

        doc.end();
      } catch (err) {
        reject(err);
      }
    });
  }
}
