// apps/invoice-service/src/app/routes/cloudinary-invoice.routes.ts
import { Router } from 'express';
import { CloudinaryInvoiceController } from '../controllers/cloudinary-invoice.controller';

const router = Router();

router.post('/cloudinary-invoices', CloudinaryInvoiceController.generateInvoice);

export default router;
