import { Router } from 'express';
import {
  getAllUsers,
  updateUserRole,
  getPendingSellers,
  approveSeller,
  getAdminDashboard,
  createAdminHandler,
  getAllVendors,
   getVendorsWithProducts,
} from '../controllers/admin.controller';

const router = Router();

/**
 * @route GET /admin/users
 * @desc Get all users
 */
router.post('/create-admin', createAdminHandler);
router.get('/users', getAllUsers);
/**
 * @route GET /admin/sellers/all-with-products
 * @desc Get all vendors with their products and admin access to login info
 */
router.get('/sellers/all-with-products', getVendorsWithProducts);

/**
 * @route PUT /admin/users/role
 * @desc Update a user's role
 */
router.put('/users/role', updateUserRole);

/**
 * @route GET /admin/sellers/pending
 * @desc Get all pending seller applications
 */
router.get('/sellers/pending', getPendingSellers);

/**
 * @route PUT /admin/sellers/status
 * @desc Approve or reject a seller
 */
router.put('/sellers/status', approveSeller);

/**
 * @route GET /admin/dashboard
 * @desc Get admin dashboard summary
 */
router.get('/dashboard', getAdminDashboard);
router.get('/sellers/all', getAllVendors);
export default router;
