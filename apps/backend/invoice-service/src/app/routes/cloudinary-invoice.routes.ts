import { Router } from 'express';
import { CloudinaryInvoiceController } from '../controllers/cloudinary-invoice.controller';

const router = Router();

// POST /api/cloudinary-invoices
router.post('/', CloudinaryInvoiceController.generateInvoice);

export default router;







