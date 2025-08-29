import { PrismaClient, PaymentMethod, PaymentStatus } from '@prisma/client';
import type { OrderStatus } from '@prisma/client';
import Stripe from 'stripe';
import { v4 as uuidv4 } from 'uuid';
import { buildOrderConfirmationEmail } from '../utils/buildOrderConfirmationEmail';
import { sendEmail } from '@shared/email';

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
const stripe = new Stripe(process.env.STRIPE_PAYMENT_SECRET_KEY!, { apiVersion: '2022-11-15' });

const VALID_STATUSES: OrderStatus[] = [
  'pending', 'confirmed', 'shipped', 'delivered', 'canceled', 'returned', 'refunded',
];
const VALID_PAYMENT_MODES = ['credit_card', 'paypal', 'cash_on_delivery'];
const vendorShippingDays = 5;

export const orderService = {
  placeOrder: async (buyerId: string, data: PlaceOrderInput) => {
    const { items, totalAmount, shippingAddressId, paymentMode } = data;
    try {
      if (!VALID_PAYMENT_MODES.includes(paymentMode)) throw new Error('Invalid payment mode.');
      if (!items || !Array.isArray(items) || items.length === 0) throw new Error('Order must contain at least one item.');

      const addresses = await addressService.getAddressesByUser(buyerId);
      const shippingAddress = addresses.find(a => a.id === shippingAddressId);
      if (!shippingAddress) throw new Error('Invalid shipping address.');

      const calculatedTotalAmount = items.reduce((total, item) => total + item.price * item.quantity, 0);
      if (calculatedTotalAmount !== totalAmount) throw new Error('Total amount mismatch.');

      const products = await prisma.product.findMany({ where: { id: { in: items.map(i => i.productId) } } });

      // COD Order
      if (paymentMode === 'cash_on_delivery') {
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
            items: { create: items.map(item => ({
              listingId: item.listingId,
              quantity: item.quantity,
              unitPrice: item.price,
              totalPrice: item.price * item.quantity,
              vendor: { connect: { id: item.vendorId } },
              product: { connect: { id: item.productId } },
            })) },
          },
          include: { items: true, shippingAddress: true },
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

        return order;
      }

      // Online payment (Stripe)
      const order = await prisma.order.create({
        data: {
          buyerId,
          totalAmount,
          shippingAddressId,
          paymentMode,
          paymentStatus: PaymentStatus.pending,
          status: 'pending',
          dispatchStatus: 'preparing',
          items: { create: items.map(item => ({
            listingId: item.listingId,
            quantity: item.quantity,
            unitPrice: item.price,
            totalPrice: item.price * item.quantity,
            vendor: { connect: { id: item.vendorId } },
            product: { connect: { id: item.productId } },
          })) },
        },
        include: { items: true, shippingAddress: true },
      });

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

      const lineItems = items.map(item => {
        const product = products.find(p => p.id === item.productId);
        return {
          price_data: {
            currency: 'usd',
            product_data: { name: product?.title || 'Unknown', description: product?.description || '' },
            unit_amount: Math.round(item.price * 100),
          },
          quantity: item.quantity,
        };
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
        },
      });

      await prisma.payment.update({ where: { id: payment.id }, data: { transactionId: session.id } });
      return { checkoutUrl: session.url };
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  updateOrderStatus: async (orderId: string, vendorId: string, status: OrderStatus) => {
    if (!VALID_STATUSES.includes(status)) throw new Error(`Invalid order status: ${status}`);
    const orderItem = await prisma.orderItem.findFirst({ where: { orderId, vendorId } });
    if (!orderItem) throw new Error('Not authorized to update this order.');

    // Update the order status
    return prisma.order.update({
      where: { id: orderId },
      data: { status },
    });
  },

  getVendorOrders: async (vendorId: string) => {
    return prisma.orderItem.findMany({
      where: { vendorId },
      include: {
        product: true,
        order: {
          include: {
            shippingAddress: true,
            buyer: { select: { name: true, email: true } },
          },
        },
      },
    });
  },

  getOrdersByUser: async (buyerId: string) => {
    return prisma.order.findMany({
      where: { buyerId },
      include: {
        items: { include: { product: { select: { title: true, imageUrls: true } } } },
        shippingAddress: true,
      },
    });
  },

  getOrderById: async (id: string) => {
    return prisma.order.findUnique({ where: { id }, include: { items: true } });
  },
};

export const addressService = {
  addAddress: async (userId: string, data: AddressInput) => {
    if (data.isDefault) {
      await prisma.address.updateMany({ where: { userId, isDefault: true }, data: { isDefault: false } });
    }
    return prisma.address.create({ data: { userId, ...data } });
  },

  getAddressesByUser: async (userId: string) => {
    const addresses = await prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { updatedAt: 'desc' }],
    });
    if (!addresses.length) throw new Error('No addresses found');
    return addresses;
  },

  editAddress: async (userId: string, addressId: string, data: Partial<AddressInput>) => {
    const existing = await prisma.address.findUnique({ where: { id: addressId } });
    if (!existing || existing.userId !== userId) throw new Error('Address not found or not owned by user');
    if (data.isDefault) await prisma.address.updateMany({ where: { userId, isDefault: true }, data: { isDefault: false } });
    return prisma.address.update({ where: { id: addressId }, data });
  },

  deleteAddress: async (userId: string, addressId: string) => {
    const existing = await prisma.address.findUnique({ where: { id: addressId } });
    if (!existing || existing.userId !== userId) throw new Error('Address not found or not owned by user');
    return prisma.address.delete({ where: { id: addressId } });
  },
};
