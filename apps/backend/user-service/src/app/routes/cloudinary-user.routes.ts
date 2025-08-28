import { Router } from 'express';
import { CloudinaryUserController } from '../controllers/cloudinary-user.controller';

const router = Router();

// GET /api/cloudinary-user/:userId/invoices
router.get('/:userId/invoices', CloudinaryUserController.getUserInvoices);

export default router;
