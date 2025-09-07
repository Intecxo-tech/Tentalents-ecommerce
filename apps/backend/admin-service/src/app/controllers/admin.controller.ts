import { Request, Response, NextFunction } from 'express';
import { adminService } from '../services/admin.service';
import { sendSuccess, sendError } from '@shared/utils';

/**
 * GET /api/admin/users
 * Fetch all users
 */
export const getAllUsers = async (
  _: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const users = await adminService.getAllUsers();
    return sendSuccess(res, '✅ All users fetched successfully', users);
  } catch (err) {
    return next(err);
  }
};
export const getAllVendors = async (req: Request, res: Response) => {
  try {
    const vendors = await adminService.getAllVendors();
    res.json(vendors);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch vendors', error: err });
  }
};

/**
 * PATCH /api/admin/users/role
 * Update a user’s role
 */
export const updateUserRole = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId, role } = req.body;

    if (!userId || !role) {
      return sendError(res, '❌ userId and role are required.', 400);
    }

    const updatedUser = await adminService.updateUserRole(userId, role);
    return sendSuccess(res, '✅ User role updated successfully', updatedUser);
  } catch (err) {
    return next(err);
  }
};

/**
 * GET /api/admin/sellers/pending
 * Fetch all pending sellers
 */
export const getPendingSellers = async (
  _: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const pending = await adminService.getPendingVendors();
    return sendSuccess(res, '✅ Pending sellers fetched successfully', pending);
  } catch (err) {
    return next(err);
  }
};

/**
 * PATCH /api/admin/sellers/approve
 * Approve or reject a seller based on admin input
 */
export const approveSeller = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { sellerId, approve } = req.body;

    if (!sellerId || typeof approve !== 'boolean') {
      return sendError(
        res,
        '❌ sellerId and approve (boolean) are required.',
        400
      );
    }

    const result = await adminService.updateVendorStatus(sellerId, approve);
    return sendSuccess(
      res,
      `✅ Seller ${approve ? 'approved' : 'rejected'} successfully`,
      result
    );
  } catch (err) {
    return next(err);
  }
};

/**
 * GET /api/admin/dashboard
 * Get admin dashboard stats (users, vendors, orders, etc.)
 */
export const getAdminDashboard = async (
  _: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const stats = await adminService.getDashboardSummary();
    return sendSuccess(res, '✅ Admin dashboard stats fetched', stats);
  } catch (err) {
    return next(err);
  }
};
