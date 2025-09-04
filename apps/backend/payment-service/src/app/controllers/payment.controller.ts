// apps/payment-service/src/controllers/payment.controller.ts

import { Request, Response, NextFunction } from 'express';
import { paymentService } from '../services/payment.service';
import { produceKafkaEvent } from '@shared/kafka';
import { sendSuccess } from '@shared/utils';
import { logger } from '@shared/logger';

export const initiatePayment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      logger.warn('[paymentController] Unauthorized payment initiation attempt');
      return res.status(401).json({ message: 'Unauthorized' });
    }

    logger.info(`[paymentController] Starting payment initiation for user: ${userId}`);

    const payment = await paymentService.initiatePayment(userId, req.body);

    logger.info(
      `[paymentController] Payment initiated successfully: paymentId=${payment.paymentId}, status=${payment.status}`
    );

    if (payment.checkoutUrl) {
      logger.info(`[paymentController] Checkout URL: ${payment.checkoutUrl}`);
    }

    sendSuccess(res, '✅ Payment initiated', payment);
  } catch (err) {
    logger.error(`[paymentController] initiatePayment error: ${(err as Error).message}`);
    next(err);
  }
};

export const verifyPayment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const paymentId = req.params.id;
    const status = req.body.status;

    logger.info(`[paymentController] Verifying paymentId=${paymentId} with status=${status}`);

    if (!['PENDING', 'SUCCESS', 'FAILED'].includes(status)) {
      logger.warn(`[paymentController] Invalid payment status received: ${status}`);
      return res.status(400).json({ message: '❌ Invalid payment status' });
    }

    const updated = await paymentService.verifyPayment(paymentId, status);

    const topic = status === 'SUCCESS' ? 'payment.success' : 'payment.failed';
    await produceKafkaEvent({
      topic,
      messages: [
        {
          key: updated.id,
          value: JSON.stringify(updated),
        },
      ],
    });

    logger.info(
      `[paymentController] Payment ${paymentId} status updated to ${status} and Kafka event sent`
    );

    sendSuccess(res, `✅ Payment ${status.toLowerCase()}`, updated);
  } catch (err) {
    logger.error(`[paymentController] verifyPayment error: ${(err as Error).message}`);
    next(err);
  }
};

export const handleStripeWebhook = async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string;

  try {
    const event = await paymentService.handleStripeWebhookRaw(req.body, sig);
    logger.info(`[paymentController] ✅ Stripe webhook processed: ${event.type}`);
    res.json({ received: true });
  } catch (err: any) {
    logger.error(`[paymentController] ❌ Stripe webhook error: ${err.message}`);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
};

// ---------------- Refund Payment ----------------
export const refundPayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { paymentId, amount } = req.body;

    if (!paymentId || typeof amount !== 'number') {
      return res.status(400).json({ message: 'Invalid paymentId or amount' });
    }

    const refund = await paymentService.refundPayment(paymentId, amount);

    logger.info(`[paymentController] Refund processed for paymentId=${paymentId}, amount=${amount}`);
    sendSuccess(res, '✅ Refund processed successfully', refund);
  } catch (err) {
    logger.error(`[paymentController] refundPayment error: ${(err as Error).message}`);
    next(err);
  }
};
