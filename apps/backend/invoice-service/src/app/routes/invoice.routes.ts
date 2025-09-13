import { Router } from 'express';
import { generateInvoiceAutomatically, downloadInvoice } from '../controllers/invoice.controller';
import { authMiddleware } from '@shared/auth';
import { ROLES } from '@shared/auth';

const router = Router();

router.post('/generate/:orderId', authMiddleware([ROLES.ADMIN]), generateInvoiceAutomatically);
router.get('/download/:orderId', authMiddleware(), downloadInvoice);

export default router;
