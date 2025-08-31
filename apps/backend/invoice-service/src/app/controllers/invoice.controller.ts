import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { PDFGenerator } from '@shared/utils';
import { uploadToCloudinary } from '@shared/auth';
import { uploadFileToMinIO } from '@shared/minio';
import { sendEmail, EmailPayload } from '@shared/email';
import axios from 'axios';

const prisma = new PrismaClient();

// ---------------- Generate invoices for all vendors ----------------
export async function generateInvoiceAutomatically(req: Request, res: Response) {
  const { orderId } = req.params;

  try {
    // Fetch order with items
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) return res.status(404).json({ error: 'Order not found' });

    // Fetch buyer details
    const userResponse = await axios.get(`http://user-service:3000/users/${order.buyerId}`);
    const user = userResponse.data;

    // Group items by vendorId
    const vendorGroups: Record<string, typeof order.items> = {};
    order.items.forEach(item => {
      const vendorId = item.vendorId;
      if (!vendorGroups[vendorId]) vendorGroups[vendorId] = [];
      vendorGroups[vendorId].push(item);
    });

    const attachments: { filename: string; content: Buffer }[] = [];

    for (const vendorId of Object.keys(vendorGroups)) {
      // Fetch vendor details
      const vendorResponse = await axios.get(`http://vendor-service:3000/vendors/${vendorId}`);
      const vendor = vendorResponse.data;

      // Fetch product details for invoice
      const items = await Promise.all(
        vendorGroups[vendorId].map(async item => {
          const productResp = await axios.get(`http://product-service:3000/products/${item.productId}`);
          const product = productResp.data;
          return {
            productId: item.productId,
            name: product.name || 'N/A',
            sku: product.sku || 'N/A',
            quantity: item.quantity,
            price: Number(item.unitPrice),
          };
        })
      );

      const shippingCost = vendorGroups[vendorId].reduce(
        (sum, item) => sum + Number(item.shippingCost || 0),
        0
      );

      const totalAmount = items.reduce((sum, i) => sum + i.price * i.quantity, 0) + shippingCost;

      const pdfOrder = {
        id: order.id,
        userId: order.buyerId,
        userName: user.name || 'Not Available',
        userEmail: user.email,
        userAddress: user.address || 'Not Available',
        vendorName: vendor.name,
        vendorEmail: vendor.email,
        vendorAddress: vendor.address || 'Not Available',
        paymentMethod: order.paymentMode,
        items,
        shippingCost,
        totalAmount,
        status: order.status,
        createdAt: order.placedAt,
      };

      // Generate PDF buffer
      const pdfBuffer = await PDFGenerator.generate(pdfOrder, 'vendor');

      // Upload PDF to Cloudinary
      const cloudinaryUrl = await uploadToCloudinary(
        pdfBuffer,
        'vendor_invoices',
        `invoice-${orderId}-${vendorId}`,
        'application/pdf'
      );

      // Upload PDF to MinIO
      const minioUrl = await uploadFileToMinIO({
        content: pdfBuffer,
        objectName: `invoices/invoice-${orderId}-${vendorId}.pdf`,
        bucketName: 'invoices',
        contentType: 'application/pdf',
      });

      // Save invoice record in DB
      await prisma.invoice.create({
        data: {
          orderId,
          vendorId,
          pdfUrl: cloudinaryUrl,
        },
      });

      // Prepare attachments for email
      attachments.push({
        filename: `invoice-${orderId}-${vendor.name}.pdf`,
        content: pdfBuffer,
      });
    }

    // Send email to buyer
    const emailPayload: EmailPayload = {
      to: user.email,
      subject: `Invoices for Order #${order.id}`,
      html: `<p>Dear ${user.name || 'Customer'},</p>
             <p>Your invoices for order ${order.id} are attached.</p>`,
      attachments,
    };
    await sendEmail(emailPayload);

    return res.status(201).json({
      message: 'Invoices generated, uploaded to Cloudinary & MinIO, and emailed to buyer',
    });
  } catch (err) {
    console.error('Error generating invoices:', err);
    return res.status(500).json({ error: 'Failed to generate invoices' });
  }
}

// ---------------- Download invoice URL ----------------
export async function getInvoiceDownloadUrl(req: Request, res: Response) {
  const { invoiceId } = req.params;

  try {
    const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });

    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });

    return res.json({ downloadUrl: invoice.pdfUrl });
  } catch (err) {
    console.error('Error fetching invoice:', err);
    return res.status(500).json({ error: 'Failed to fetch invoice' });
  }
}
