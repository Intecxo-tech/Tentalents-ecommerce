import { Request, Response, NextFunction } from 'express';
import { orderService } from '../services/order.service';
import { produceKafkaEvent } from '@shared/kafka';
import { sendSuccess } from '@shared/utils';
import type { AuthPayload } from '@shared/auth';
import { addressService,returnRequestService } from '../services/order.service';
interface AuthedRequest extends Request {
  user?: AuthPayload;
}

export const placeOrder = async (
  req: AuthedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: '❌ Unauthorized: missing user ID' });
    }

    // Pass the request body directly to placeOrder, which already does address validation
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


export const getUserOrders = async (
  req: AuthedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res
        .status(401)
        .json({ message: '❌ Unauthorized: missing user ID' });
    }

    const orders = await orderService.getOrdersByUser(userId);
    sendSuccess(res, '📦 Orders fetched', orders);
  } catch (err) {
    next(err);
  }
};

export const getOrderById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const orderId = req.params.id;
    if (!orderId) {
      return res.status(400).json({ message: '❌ Order ID is required' });
    }

    const order = await orderService.getOrderById(orderId);
    if (!order) {
      return res.status(404).json({ message: '❌ Order not found' });
    }

    sendSuccess(res, '📄 Order details fetched', order);
  } catch (err) {
    next(err);
  }
};
export const cancelOrder = async (
  req: AuthedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const buyerId = req.user?.userId;
    const orderId = req.params.id;

    if (!buyerId) {
      return res.status(401).json({ message: 'Unauthorized: missing user ID' });
    }

    if (!orderId) {
      return res.status(400).json({ message: 'Order ID is required' });
    }

    const canceledOrder = await orderService.cancelOrder(orderId, buyerId);

    // Optionally, produce Kafka event here
    await produceKafkaEvent({
      topic: 'order.cancelled',
      messages: [{ value: JSON.stringify(canceledOrder) }],
    });

    sendSuccess(res, '✅ Order cancelled successfully', canceledOrder);
  } catch (err) {
    next(err);
  }
};


export const updateOrderStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const orderId = req.params.id;
    const { status } = req.body;

    if (!status) {
      return res
        .status(400)
        .json({ message: '❌ Missing order status in request body' });
    }

    const updated = await orderService.updateOrderStatus(orderId, status);

    // Removed Kafka event production here

    sendSuccess(res, '✅ Order status updated', updated);
  } catch (err) {
    next(err);
  }
};

export const addAddress = async (
  req: AuthedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const address = await addressService.addAddress(userId, req.body);
    res.status(201).json({ message: 'Address added', data: address });
  } catch (err) {
    next(err);
  }
};

export const editAddress = async (
  req: AuthedRequest,
  res: Response,
  next: NextFunction
) => {
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

export const deleteAddress = async (
  req: AuthedRequest,
  res: Response,
  next: NextFunction
) => {
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
    console.log(`Fetching addresses for userId: ${userId}`);
    // Make sure we're calling the correct service for fetching addresses
    const addresses = await addressService.getAddressesByUser(userId); // Correct service
    sendSuccess(res, '📍 Addresses fetched', addresses); 
  } catch (err) {
    next(err);  // Handle any errors
  }
};
export const getVendorOrders = async (
  req: AuthedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
const vendorId = req.user?.vendorId;
    if (!vendorId) {
      return res.status(401).json({ message: 'Unauthorized: Missing vendor ID' });
    }

   const orders = await orderService.getVendorOrders(vendorId);
    sendSuccess(res, '📦 Vendor orders fetched', orders);
  } catch (err) {
    next(err);
  }
};
export const updateDispatchStatus = async (
  req: AuthedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const orderId = req.params.id;
    const { dispatchStatus } = req.body;

    if (!dispatchStatus) {
      return res.status(400).json({ message: 'Dispatch status is required' });
    }

    const updated = await orderService.updateDispatchStatus(orderId, dispatchStatus);

    // Optional Kafka event production wrapped in try-catch
    try {
      await produceKafkaEvent({
        topic: 'dispatch.status.updated',
        messages: [{ value: JSON.stringify(updated) }],
      });
    } catch (kafkaErr) {
      console.error('Kafka produce error (ignored):', kafkaErr);
      // Continue without failing the request
    }

    sendSuccess(res, '🚚 Dispatch status updated', updated);
  } catch (err) {
    next(err);
  }
};
export const createReturnRequest = async (
  req: AuthedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log('📥 Incoming return request...');

    const buyerId = req.user?.userId;
    const { orderId, reason, replacementProductId, comment } = req.body;
    const imageFiles = req.files as Express.Multer.File[];

    console.log('🧾 Request body:', req.body);
    console.log('🧑‍💼 Authenticated user ID:', buyerId);
    console.log('📸 Uploaded image files:', imageFiles?.map((f) => f.originalname));

    if (!buyerId) {
      console.warn('❌ No user ID found in token');
      return res.status(401).json({ message: '❌ Unauthorized: missing user ID' });
    }

    if (!orderId || !reason) {
      console.warn('❌ Missing orderId or reason');
      return res.status(400).json({ message: '❌ Order ID and reason are required' });
    }

    // Create the return request using the service
    const returnRequest = await returnRequestService.createReturnRequest(
      orderId,
      buyerId,
      reason,
      imageFiles,
      replacementProductId,
      comment
    );

    console.log('✅ Return request created:', returnRequest);

    sendSuccess(res, '✅ Return request created successfully', returnRequest);
  } catch (err) {
    console.error('❌ Error in createReturnRequest controller:', err);
    next(err);
  }
};

// 2. Get Return Requests for a User (Buyer)
export const getReturnRequestsByUser = async (
  req: AuthedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const buyerId = req.user?.userId;  // Get the buyer's user ID

    if (!buyerId) {
      return res.status(401).json({ message: '❌ Unauthorized: missing user ID' });
    }

    const returnRequests = await returnRequestService.getReturnRequestsByUser(buyerId);
    sendSuccess(res, '📄 Return requests fetched', returnRequests);
  } catch (err) {
    next(err);
  }
};

// 3. Update Return Request Status (Admin/Vendor Approval)
export const updateReturnRequestStatus = async (
  req: AuthedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { returnRequestId, status } = req.body;  // Get the returnRequestId and status (approved/rejected) from request body
    const userId = req.user?.userId;  // Get the user's ID (Admin/Vendor)

    if (!userId) {
      return res.status(401).json({ message: '❌ Unauthorized: missing user ID' });
    }

    if (!returnRequestId || !status) {
      return res.status(400).json({ message: '❌ Return request ID and status are required' });
    }

    if (status !== 'approved' && status !== 'rejected') {
      return res.status(400).json({ message: '❌ Invalid status. Must be "approved" or "rejected"' });
    }

    const updatedReturnRequest = await returnRequestService.updateReturnRequestStatus(returnRequestId, status);

    sendSuccess(res, `✅ Return request ${status} successfully`, updatedReturnRequest);
  } catch (err) {
    next(err);
  }
};