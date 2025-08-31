import { Router } from 'express';
import { generateInvoiceAutomatically, getInvoiceDownloadUrl } from '../controllers/invoice.controller';

const router = Router();

router.post('/generate/:orderId', generateInvoiceAutomatically);
router.get('/download/:invoiceId', getInvoiceDownloadUrl);

export default router;
