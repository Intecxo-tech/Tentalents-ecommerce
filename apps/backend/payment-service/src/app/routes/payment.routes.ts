import express, { Router } from 'express';
import Stripe from 'stripe';
import { initiatePayment, verifyPayment } from '../controllers/payment.controller';
import { authMiddleware, requireRole } from '@shared/auth';
import { paymentService } from '../services/payment.service';
import { PrismaClient, PaymentStatus  } from '@prisma/client';
const stripe = new Stripe(process.env.STRIPE_PAYMENT_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
});
const router = Router();
const prisma = new PrismaClient();

// 🧾 Initiate a payment
router.post('/', authMiddleware(['buyer', 'buyer_seller']), initiatePayment);

// ✅ Verify payment status
router.get('/', authMiddleware(), requireRole('buyer', 'buyer_seller'), verifyPayment);

// 🔔 Stripe Webhook
router.post(
  '/stripe/webhook',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    const sigHeader = req.headers['stripe-signature'];
    if (!sigHeader) {
      console.error('Missing Stripe signature');
      return res.status(400).send('Missing Stripe signature');
    }

    try {
      const rawBody = req.body as Buffer;
      const sig = Array.isArray(sigHeader) ? sigHeader[0] : sigHeader;

      // This will internally update payment + order
      const event = await paymentService.handleStripeWebhookRaw(rawBody, sig);

      console.log('Stripe event processed:', event.type);

      res.sendStatus(200);
    } catch (err: any) {
      console.error(`Webhook verification failed: ${err.message}`);
      res.status(400).send('Webhook verification failed');
    }
  }
);
router.get('/stripe-session/:session_id', async (req, res) => {
  const { session_id } = req.params;

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (!session) {
      return res.status(404).json({ error: 'Stripe session not found' });
    }

    const paymentStatus = session.payment_status === 'paid' ? 'success' : 'pending';

    res.json({
      payment: {
        id: session.id,
        status: paymentStatus,
        amount_total: session.amount_total,
        currency: session.currency,
      },
    });
  } catch (error) {
    console.error('Error fetching Stripe session:', error);
    res.status(500).json({ error: 'Failed to fetch payment info' });
  }
});
router.get('/status/:paymentId', async (req, res) => {
  const { paymentId } = req.params;

  try {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    res.json({
      paymentId: payment.id,
      status: payment.status,
      amount: payment.amount,
    });
  } catch (error) {
    console.error('Error fetching payment status:', error);
    res.status(500).json({ error: 'Failed to fetch payment status' });
  }
});
export default router;
