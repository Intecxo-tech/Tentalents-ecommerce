import { Request, Response, NextFunction } from 'express';
import { adminService } from '../services/admin.service';
import { sendSuccess, sendError } from '@shared/utils';

/**
 * GET /api/admin/vendors/products
 * Fetch all vendors with their products + login info (plaintext password)
 */
export const getVendorsWithProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const vendors = await adminService.getAllVendorsWithProducts();
    return sendSuccess(
      res,
      '✅ Fetched all vendors with products and login info successfully',
      vendors
    );
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/admin/users
 * Fetch all users with addresses and vendor info
 */
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await adminService.getAllUsers();
    return res.status(200).json({
      success: true,
      message: '✅ Fetched all users with full details successfully',
      data: users,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * POST /api/admin/create
 * Create an admin user with vendor and plaintext password
 */
export const createAdminHandler = async (req: Request, res: Response) => {
  try {
    const { user, vendor } = await adminService.createAdminWithVendor();
    return res.status(201).json({ user, vendor });
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
};

/**
 * GET /api/admin/vendors
 * Fetch all vendors without product details
 */
export const getAllVendors = async (req: Request, res: Response) => {
  try {
    const vendors = await adminService.getAllVendors();
    return res.status(200).json({
      success: true,
      message: '✅ Fetched all vendors successfully',
      data: vendors,
    });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch vendors', error: err });
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
 * Fetch all pending vendors/sellers
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
 * Approve or reject a seller/vendor
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
 * Get admin dashboard stats
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
