import { PrismaClient, PaymentMethod, PaymentStatus } from '@prisma/client';
import type { OrderStatus } from '@prisma/client';
import Stripe from 'stripe';
import { v4 as uuidv4 } from 'uuid';
import { buildOrderConfirmationEmail } from '../utils/buildOrderConfirmationEmail';
import { sendEmail } from '@shared/email';
import axios from 'axios';

interface OrderItemInput {
  productId: string;
  vendorId: string;
  listingId: string;
  quantity: number;
  price: number;
}

interface PlaceOrderInput {
  items: OrderItemInput[];
  totalAmount: number;
  shippingAddressId: string;
  paymentMode: 'credit_card' | 'paypal' | 'cash_on_delivery';
}

interface AddressInput {
  name: string;
  phone: string;
  country: string;
  state: string;
  city: string;
  pinCode: string;
  addressLine1: string;
  addressLine2?: string;
  addressType: string;
  isDefault?: boolean;
}

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_PAYMENT_SECRET_KEY!, { apiVersion: '2025-07-30.basil' });

const INVOICE_SERVICE_URL = process.env.INVOICE_SERVICE_URL || 'http://localhost:3009';

const VALID_STATUSES: OrderStatus[] = [
  'pending',
  'confirmed',
  'shipped',
  'delivered',
  'canceled',
  'returned',
  'refunded',
];

const VALID_PAYMENT_MODES = ['credit_card', 'paypal', 'cash_on_delivery'];
const vendorShippingDays = 5;

async function createInvoice(orderId: string) {
  try {
    const response = await axios.post(`${INVOICE_SERVICE_URL}/api/invoices/generate/${orderId}`);
    return response.data;
  } catch (err: any) {
    console.error(`[orderService] Failed to create invoice for order ${orderId}:`, err.response?.data || err.message);
    throw new Error('Invoice creation failed');
  }
}

export const orderService = {
  placeOrder: async (buyerId: string, data: PlaceOrderInput) => {
    const { items, totalAmount, shippingAddressId, paymentMode } = data;

    try {
      if (!VALID_PAYMENT_MODES.includes(paymentMode)) throw new Error('Invalid payment mode.');
      if (!items || items.length === 0) throw new Error('Order must contain at least one item.');

      // Validate shipping address
      const addresses = await addressService.getAddressesByUser(buyerId);
      const shippingAddress = addresses.find(a => a.id === shippingAddressId);
      if (!shippingAddress) throw new Error('Invalid shipping address.');

      // Validate total amount
      const calculatedTotalAmount = items.reduce((total, item) => total + item.price * item.quantity, 0);
      if (calculatedTotalAmount !== totalAmount) throw new Error('Total amount mismatch.');

      // Fetch product details
      const products = await prisma.product.findMany({
        where: { id: { in: items.map(i => i.productId) } },
      });

      // 💳 Online payment → Stripe
      if (paymentMode === 'credit_card') {
        const lineItems = items.map(item => {
          const product = products.find(p => p.id === item.productId);
          if (!product) throw new Error(`Product with ID ${item.productId} not found`);
          return {
            price_data: {
              currency: 'usd',
              product_data: {
                name: product.title,
                description: product.description || '',
                images: product.imageUrls || [],
              },
              unit_amount: Math.round(item.price * 100),
            },
            quantity: item.quantity,
          };
        });

        // Create order
        const order = await prisma.order.create({
          data: {
            buyerId,
            totalAmount,
            shippingAddressId,
            paymentMode,
            paymentStatus: PaymentStatus.pending,
            status: 'pending',
            dispatchStatus: 'preparing',
            items: {
              create: items.map(item => ({
                listingId: item.listingId,
                quantity: item.quantity,
                unitPrice: item.price,
                totalPrice: item.price * item.quantity,
                vendor: { connect: { id: item.vendorId } },
                product: { connect: { id: item.productId } },
              })),
            },
          },
          include: { items: { include: { product: true, vendor: true } }, shippingAddress: true },
        });

        // Payment record
        const payment = await prisma.payment.create({
          data: {
            id: uuidv4(),
            userId: buyerId,
            amount: totalAmount,
            method: PaymentMethod.card,
            status: PaymentStatus.pending,
            orderId: order.id,
            transactionId: '',
          },
        });

        const session = await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          line_items: lineItems,
          mode: 'payment',
          success_url: `${process.env.FRONTEND_URL}/order-success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${process.env.FRONTEND_URL}/order-cancelled`,
          metadata: {
            orderId: order.id,
            paymentId: payment.id,
            userId: buyerId,
            shippingAddressId,
            totalAmount: totalAmount.toString(),
            items: JSON.stringify(items),
            paymentMode,
          },
        });

        await prisma.payment.update({
          where: { id: payment.id },
          data: { transactionId: session.id },
        });

        // ✅ Create invoice
        await createInvoice(order.id);

        return { checkoutUrl: session.url };
      }

      // 🛒 COD → Create order immediately
      const order = await prisma.order.create({
        data: {
          buyerId,
          totalAmount,
          shippingAddressId,
          paymentMode,
          paymentStatus: PaymentStatus.pending,
          status: 'pending',
          dispatchStatus: 'preparing',
          dispatchTime: new Date(Date.now() + vendorShippingDays * 24 * 60 * 60 * 1000),
          items: {
            create: items.map(item => ({
              listingId: item.listingId,
              quantity: item.quantity,
              unitPrice: item.price,
              totalPrice: item.price * item.quantity,
              vendor: { connect: { id: item.vendorId } },
              product: { connect: { id: item.productId } },
            })),
          },
        },
        include: { items: { include: { product: true, vendor: true } }, shippingAddress: true },
      });

      await prisma.payment.create({
        data: {
          id: uuidv4(),
          userId: buyerId,
          amount: totalAmount,
          method: PaymentMethod.cod,
          status: PaymentStatus.success,
          orderId: order.id,
          transactionId: uuidv4(),
        },
      });

      // ✅ Create invoice
      await createInvoice(order.id);

      return order;
    } catch (error) {
      console.error('Error placing order for buyerId:', buyerId, error);
      throw error;
    }
  },

  updateDispatchStatus: async (
    orderId: string,
    dispatchStatus: 'preparing' | 'failed' | 'not_started' | 'dispatched' | 'in_transit' | 'delivered'
  ) => prisma.order.update({ where: { id: orderId }, data: { dispatchStatus } }),

  updateOrderStatus: async (orderId: string, status: OrderStatus) => {
    if (!VALID_STATUSES.includes(status)) throw new Error(`Invalid order status: ${status}`);
    return prisma.order.update({ where: { id: orderId }, data: { status } });
  },

  getOrdersByUser: async (buyerId: string) =>
    prisma.order.findMany({
      where: { buyerId },
      include: {
        items: { include: { product: { select: { title: true, imageUrls: true } } } },
        shippingAddress: true,
      },
    }),

  getOrderById: async (id: string) => prisma.order.findUnique({ where: { id }, include: { items: true } }),

  getVendorOrders: async (vendorId: string) =>
    prisma.orderItem.findMany({
      where: { vendorId },
      include: {
        product: true,
        order: { include: { shippingAddress: true, buyer: { select: { name: true, email: true } } } },
      },
    }),

  cancelOrder: async (buyerId: string, orderId: string) => {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order || order.buyerId !== buyerId) throw new Error('Unauthorized or order not found');
    return prisma.order.update({ where: { id: orderId }, data: { status: 'canceled' } });
  },

  initiateReturn: async (buyerId: string, orderId: string) => {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order || order.buyerId !== buyerId) throw new Error('Unauthorized or order not found');
    return prisma.order.update({ where: { id: orderId }, data: { status: 'returned' } });
  },
};

// ---------------- ADDRESS SERVICE ----------------

export const addressService = {
  addAddress: async (userId: string, data: AddressInput) => {
    if (data.isDefault)
      await prisma.address.updateMany({ where: { userId, isDefault: true }, data: { isDefault: false } });
    return prisma.address.create({ data: { userId, ...data } });
  },

  getAddressesByUser: async (userId: string) =>
    prisma.address.findMany({ where: { userId }, orderBy: [{ isDefault: 'desc' }, { updatedAt: 'desc' }] }),

  editAddress: async (userId: string, addressId: string, data: Partial<AddressInput>) => {
    const existing = await prisma.address.findUnique({ where: { id: addressId } });
    if (!existing || existing.userId !== userId) throw new Error('Address not found or not owned by user');
    if (data.isDefault)
      await prisma.address.updateMany({ where: { userId, isDefault: true }, data: { isDefault: false } });
    return prisma.address.update({ where: { id: addressId }, data });
  },

  deleteAddress: async (userId: string, addressId: string) => {
    const existing = await prisma.address.findUnique({ where: { id: addressId } });
    if (!existing || existing.userId !== userId) throw new Error('Address not found or not owned by user');
    return prisma.address.delete({ where: { id: addressId } });
  },
};
