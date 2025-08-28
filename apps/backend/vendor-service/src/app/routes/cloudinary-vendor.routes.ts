import { Router } from 'express';
import { CloudinaryVendorController } from '../controllers/cloudinary-vendor.controller';

const router = Router();

// GET /api/cloudinary-vendor/:vendorId/invoices
router.get('/:vendorId/invoices', CloudinaryVendorController.getVendorInvoices);

export default router;
