import { Request, Response, NextFunction } from 'express';
import { orderService } from '../services/order.service';
import { produceKafkaEvent } from '@shared/kafka';
import { sendSuccess } from '@shared/utils';
import type { AuthPayload } from '@shared/auth';
import { addressService } from '../services/order.service';
import axios from 'axios';
import { PrismaClient } from '@prisma/client';

interface AuthedRequest extends Request {
  user?: AuthPayload;
}

const prisma = new PrismaClient();

// ---------------- ORDER CONTROLLERS ----------------

export const placeOrder = async (req: AuthedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: '❌ Unauthorized: missing user ID' });

    const order = await orderService.placeOrder(userId, req.body);

    await produceKafkaEvent({
      topic: 'order.created',
      messages: [{ value: JSON.stringify(order) }],
    });

    sendSuccess(res, '✅ Order placed successfully', order);
  } catch (err) {
    next(err);
  }
};

export const getUserOrders = async (req: AuthedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: '❌ Unauthorized: missing user ID' });

    const orders = await orderService.getOrdersByUser(userId);
    sendSuccess(res, '📦 Orders fetched', orders);
  } catch (err) {
    next(err);
  }
};

export const getOrderById = async (req: AuthedRequest, res: Response, next: NextFunction) => {
  try {
    const orderId = req.params.orderId;
    if (!orderId) return res.status(400).json({ message: '❌ Order ID is required' });

    const order = await orderService.getOrderById(orderId);
    if (!order) return res.status(404).json({ message: '❌ Order not found' });

    sendSuccess(res, '📄 Order details fetched', order);
  } catch (err) {
    next(err);
  }
};

export const updateOrderStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orderId = req.params.orderId;
    const { status } = req.body;
    if (!status) return res.status(400).json({ message: '❌ Missing order status in request body' });

    const updated = await orderService.updateOrderStatus(orderId, status);

    await produceKafkaEvent({
      topic: 'order.updated',
      messages: [{ value: JSON.stringify(updated) }],
    });

    sendSuccess(res, '✅ Order status updated', updated);
  } catch (err) {
    next(err);
  }
};

// ---------------- ADDRESS CONTROLLERS ----------------

export const addAddress = async (req: AuthedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const address = await addressService.addAddress(userId, req.body);
    res.status(201).json({ message: 'Address added', data: address });
  } catch (err) {
    next(err);
  }
};

export const editAddress = async (req: AuthedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    const addressId = req.params.addressId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const updatedAddress = await addressService.editAddress(userId, addressId, req.body);
    res.json({ message: 'Address updated', data: updatedAddress });
  } catch (err) {
    next(err);
  }
};

export const deleteAddress = async (req: AuthedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    const addressId = req.params.addressId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    await addressService.deleteAddress(userId, addressId);
    res.json({ message: 'Address deleted' });
  } catch (err) {
    next(err);
  }
};

export const getUserAddresses = async (req: AuthedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const addresses = await addressService.getAddressesByUser(userId);
    sendSuccess(res, '📍 Addresses fetched', addresses);
  } catch (err) {
    next(err);
  }
};

// ---------------- VENDOR CONTROLLERS ----------------

export const getVendorOrders = async (req: AuthedRequest, res: Response, next: NextFunction) => {
  try {
    const vendorId = req.user?.vendorId;
    if (!vendorId) return res.status(401).json({ message: 'Unauthorized: Missing vendor ID' });

    const orders = await orderService.getVendorOrders(vendorId);
    sendSuccess(res, '📦 Vendor orders fetched', orders);
  } catch (err) {
    next(err);
  }
};

export const updateDispatchStatus = async (req: AuthedRequest, res: Response, next: NextFunction) => {
  try {
    const orderId = req.params.orderId;
    const { dispatchStatus } = req.body;
    if (!dispatchStatus) return res.status(400).json({ message: 'Dispatch status is required' });

    const updated = await orderService.updateDispatchStatus(orderId, dispatchStatus);

    await produceKafkaEvent({
      topic: 'dispatch.status.updated',
      messages: [{ value: JSON.stringify(updated) }],
    });

    sendSuccess(res, '🚚 Dispatch status updated', updated);
  } catch (err) {
    next(err);
  }
};

// ---------------- INVOICE DOWNLOAD CONTROLLER ----------------

export const downloadInvoice = async (req: AuthedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    const invoiceId = req.params.invoiceId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    if (!invoiceId) return res.status(400).json({ message: 'Invoice ID is required' });

    const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });

    // Check ownership
    if (invoice.orderId) {
      const order = await prisma.order.findUnique({ where: { id: invoice.orderId } });
      if (!order || order.buyerId !== userId) {
        return res.status(403).json({ message: 'Forbidden: You cannot access this invoice' });
      }
    }

    // Stream PDF from Cloudinary / MinIO
    const response = await axios.get(invoice.pdfUrl, { responseType: 'stream' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${invoiceId}.pdf`);

    response.data.pipe(res);
  } catch (err: any) {
    next(err);
  }
};

// ---------------- CANCEL & RETURN CONTROLLERS ----------------

// Cancel order
export const cancelOrder = async (req: AuthedRequest, res: Response, next: NextFunction) => {
  try {
    const orderId = req.params.orderId;
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const order = await orderService.cancelOrder(userId, orderId);

    await produceKafkaEvent({
      topic: 'order.cancelled',
      messages: [{ value: JSON.stringify(order) }],
    });

    sendSuccess(res, '✅ Order cancelled successfully', order);
  } catch (err) {
    next(err);
  }
};

// Return order
export const returnOrder = async (req: AuthedRequest, res: Response, next: NextFunction) => {
  try {
    const orderId = req.params.orderId;
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const order = await orderService.initiateReturn(userId, orderId);

    await produceKafkaEvent({
      topic: 'order.returned',
      messages: [{ value: JSON.stringify(order) }],
    });

    sendSuccess(res, '✅ Return initiated successfully', order);
  } catch (err) {
    next(err);
  }
};
