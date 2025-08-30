import { PrismaClient, OrderStatus as PrismaOrderStatus } from '@prisma/client';
import { PDFGenerator } from '@shared/utils';
import { sendEmail, EmailPayload } from '@shared/email';
import { produceKafkaEvent } from '@shared/kafka';
import { KAFKA_TOPICS } from '@shared/constants';
import { uploadToCloudinary } from '@shared/auth'; // <-- import Cloudinary

const prisma = new PrismaClient();

// PDF-friendly types
interface PDFOrderItem {
  productId: string;
  quantity: number;
  price: number;
}

interface PDFOrder {
  id: string;
  userId: string;
  items: PDFOrderItem[];
  totalAmount: number;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

// Map Prisma OrderStatus to PDFOrder status
function mapStatus(status: PrismaOrderStatus): PDFOrder['status'] {
  switch (status) {
    case 'pending':
    case 'confirmed':
      return 'pending';
    case 'shipped':
      return 'shipped';
    case 'delivered':
      return 'delivered';
    case 'canceled':
      return 'cancelled';
    case 'returned':
    case 'refunded':
      return 'paid';
    default:
      return 'pending';
  }
}

export async function processOrder(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: true,
      buyer: true,
    },
  });

  if (!order) throw new Error(`Order ${orderId} not found`);

  // Map to PDFOrder
  const pdfOrder: PDFOrder = {
    id: order.id,
    userId: order.buyerId,
    items: order.items.map(item => ({
      productId: item.productId,
      quantity: item.quantity,
      price: Number(item.unitPrice),
    })),
    totalAmount: Number(order.totalAmount),
    status: mapStatus(order.status),
    createdAt: order.placedAt,
    updatedAt: order.updatedAt,
  };

  // Generate PDF
  const pdfBuffer = await PDFGenerator.generate(pdfOrder, 'user');

  // Upload PDF to Cloudinary
  const pdfUrl = await uploadToCloudinary(pdfBuffer, 'invoices', `invoice-${order.id}`, 'application/pdf');

  // Email payload
  const emailPayload: EmailPayload = {
    to: order.buyer.email!,
    subject: `Invoice for Order ${order.id}`,
    html: `<p>Please find your order invoice <a href="${pdfUrl}" target="_blank">here</a>.</p>`,
    // attachments optional, can still send buffer if needed
  };

  await sendEmail(emailPayload);

  // Produce Kafka event
  await produceKafkaEvent({
    topic: KAFKA_TOPICS.INVOICE_GENERATE,
    messages: [
      {
        value: JSON.stringify({
          orderId: order.id,
          userId: order.buyerId,
          pdfUrl, // <-- include Cloudinary URL in event
          generatedAt: new Date().toISOString(),
        }),
      },
    ],
  });

  return { success: true, pdfUrl };
}
