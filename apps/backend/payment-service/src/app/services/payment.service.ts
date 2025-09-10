import { PrismaClient, PaymentMethod, PaymentStatus } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '@shared/logger';
import { orderService } from '@order-service/services/order.service';
import Stripe from 'stripe';
import { cartService } from '@cart-service/services/cart.service';
interface InitiatePaymentDTO {
  amount: number;
  method: PaymentMethod;
  orderId: string;
  shippingAddressId: string;
  items: any[];
  totalAmount: number;
}

const prisma = new PrismaClient();

const stripe = new Stripe(process.env.STRIPE_PAYMENT_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
});

export const paymentService = {
  initiatePayment: async (userId: string, data: InitiatePaymentDTO) => {
    const { amount, method, orderId, shippingAddressId, items, totalAmount } = data;

    // COD payments → no Stripe needed
  if (method === PaymentMethod.cod) {
  const order = await orderService.placeOrder(userId, {
    items,
    totalAmount,
    shippingAddressId,
    paymentMode: 'cash_on_delivery',
  });

  if ('id' in order) {
    logger.info(`[paymentService] Created order ${order.id} for user ${userId} via COD`);

    // ✅ Clear cart after successful COD order
    try {
      await cartService.checkout(userId);
    } catch (err) {
      logger.warn(`[paymentService] Failed to clear cart for COD: ${err}`);
    }

    return {
      paymentId: null,
      amount,
      method,
      status: PaymentStatus.success,
      orderId: order.id,
    };
  } else {
    throw new Error('Order creation failed for COD');
  }
    }

    // Create payment entry first
    const payment = await prisma.payment.create({
      data: {
        id: uuidv4(),
        userId,
        amount,
        method,
        status: PaymentStatus.pending,
        orderId,
        transactionId: method === PaymentMethod.card ? '' : `manual-${uuidv4()}`,
      },
    });

    logger.info(`[paymentService] Created payment entry: ${payment.id} for order ${orderId}`);

    // Card payment → Create Stripe Checkout Session
    if (method === PaymentMethod.card) {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: { name: `Order #${orderId}` },
              unit_amount: Math.round(amount * 100),
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${process.env.BASE_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.BASE_URL}/payment-cancelled?session_id={CHECKOUT_SESSION_ID}`,
        metadata: {
          paymentId: payment.id,
          orderId,
          userId,
          shippingAddressId,
          totalAmount: totalAmount.toString(),
          items: JSON.stringify(items),
          paymentMode: method,
        },
      });

      // Update payment with Stripe session ID
      await prisma.payment.update({
        where: { id: payment.id },
        data: { transactionId: session.id },
      });

      logger.info(`[paymentService] Stripe Checkout session created: ${session.url}`);

      return {
        paymentId: payment.id,
        amount,
        method,
        status: payment.status,
        checkoutUrl: session.url,
      };
    }

    // UPI payment → Generate QR code
    const qrCode =
      method === PaymentMethod.upi
        ? `upi://pay?pa=merchant@upi&pn=EcomStore&am=${amount}`
        : undefined;

    return {
      paymentId: payment.id,
      amount,
      method,
      status: payment.status,
      qrCode,
    };
  },

  // In payment.service.ts

// ... inside the paymentService object

  handleStripeWebhook: async (event: Stripe.Event) => {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      logger.info(`[Stripe Webhook] Session metadata: ${JSON.stringify(session.metadata)}`);
      
      if (!session.metadata) {
        throw new Error('Metadata missing from Stripe session');
      }

      const { orderId, userId,paymentId } = session.metadata; // <-- Get userId from metadata

      if (!orderId || !userId ) { // <-- Make sure userId exists
        throw new Error('Webhook metadata missing orderId or userId');
      }
      
      // ... your existing code to update payment and order status ...
      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: 'confirmed',
          paymentStatus: PaymentStatus.success,
        },
      });

      // ======================= THIS IS THE FIX =======================
      
      // BEFORE:
      /*
      try {
        await cartService.checkout(session.metadata.userId);
      } catch (err) {
        logger.warn(`[paymentService] Failed to clear cart after Stripe payment: ${err}`);
      }
      */
await prisma.payment.update({
        where: { id: paymentId },
        data: {
            status: PaymentStatus.success,
            // It's also good practice to store the final transaction ID from Stripe
            transactionId: session.payment_intent as string,
        },
    });
    console.log(`✅💰 Payment status updated for paymentId: ${paymentId}`);
      // AFTER: Replace the above with the direct Prisma call
      try {
        await prisma.cartItem.deleteMany({
          where: {
            userId: userId, // Use the userId from the metadata
          },
        });
        console.log(`✅🛒 Cart successfully cleared for user: ${userId} after Stripe payment.`);
      } catch (err) {
        console.error(`❌🛒 Failed to clear cart for user: ${userId} after Stripe payment. Error:`, err);
        // Even if this fails, we don't stop the process, but now we have a clear error log.
      }
      // ===============================================================
    }
  },

// ... rest of the file


  handleStripeWebhookRaw: async (rawBody: Buffer, signature: string): Promise<Stripe.Event> => {
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        rawBody,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err: any) {
      logger.error(`[paymentService] ❌ Webhook signature verification failed: ${err.message}`);
      throw new Error('Invalid Stripe signature');
    }

    await paymentService.handleStripeWebhook(event);
    return event;
  },

  verifyPayment: async (paymentId: string, status: PaymentStatus) => {
    const validStatuses = [PaymentStatus.pending, PaymentStatus.success, PaymentStatus.failed];
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid payment status: ${status}`);
    }

    const updated = await prisma.payment.update({
      where: { id: paymentId },
      data: { status },
    });

    logger.info(`[paymentService] 💸 Payment ${paymentId} updated to ${status}`);
    return updated;
  },
};
