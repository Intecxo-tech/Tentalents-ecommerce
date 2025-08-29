import { Request, Response, NextFunction } from 'express';
import { orderService } from '../services/order.service';
import { produceKafkaEvent } from '@shared/kafka';
import { sendSuccess } from '@shared/utils';
import type { AuthPayload } from '@shared/auth';
import { addressService } from '../services/order.service';

interface AuthedRequest extends Request {
  user?: AuthPayload;
}

// ------------------- Buyer endpoints -------------------
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

export const getOrderById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orderId = req.params.id;
    if (!orderId) return res.status(400).json({ message: '❌ Order ID is required' });

    const order = await orderService.getOrderById(orderId);
    if (!order) return res.status(404).json({ message: '❌ Order not found' });

    sendSuccess(res, '📄 Order details fetched', order);
  } catch (err) {
    next(err);
  }
};

// ------------------- Vendor endpoints -------------------
export const getVendorOrders = async (req: AuthedRequest, res: Response, next: NextFunction) => {
  try {
    const vendorId = req.user?.userId;
    if (!vendorId) return res.status(401).json({ message: '❌ Unauthorized: missing vendor ID' });

    const orders = await orderService.getVendorOrders(vendorId);
    sendSuccess(res, '📦 Vendor orders fetched', orders);
  } catch (err) {
    next(err);
  }
};

export const updateOrderStatus = async (req: AuthedRequest, res: Response, next: NextFunction) => {
  try {
    const vendorId = req.user?.userId;
    const orderId = req.params.id;
    const { status } = req.body;

    if (!vendorId) return res.status(401).json({ message: '❌ Unauthorized: missing vendor ID' });
    if (!status) return res.status(400).json({ message: '❌ Missing order status in request body' });

    const updated = await orderService.updateOrderStatus(orderId, vendorId, status);

    await produceKafkaEvent({
      topic: 'order.updated',
      messages: [{ value: JSON.stringify(updated) }],
    });

    sendSuccess(res, '✅ Order status updated', updated);
  } catch (err) {
    next(err);
  }
};

// ------------------- Address endpoints -------------------
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
    const addressId = req.params.id;
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
    const addressId = req.params.id;
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
