import { Router } from 'express';
import { generateInvoiceAutomatically, downloadInvoice } from '../controllers/invoice.controller';
import { requireAuth, ROLES } from '@shared/auth';

const router = Router();

router.post('/:orderId/generate', requireAuth([ROLES.ADMIN]), generateInvoiceAutomatically);

router.get('/:orderId/download', requireAuth([ROLES.ADMIN, ROLES.BUYER]), downloadInvoice);

export default router;