import { Router } from 'express';
import { uploadInvoiceController } from '../controllers/cloudinary-invoice.controller';

const router = Router();

// POST /api/cloudinary/invoice/upload
router.post('/upload', uploadInvoiceController);

export default router;
