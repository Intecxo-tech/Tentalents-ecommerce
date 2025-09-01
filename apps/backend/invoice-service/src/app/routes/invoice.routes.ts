import { Router } from 'express';
import { generateInvoiceAutomatically, getInvoiceDownloadUrl } from '../controllers/invoice.controller';

const router = Router();

// Route to manually generate an invoice (can also be triggered programmatically)
router.post('/generate/:orderId', generateInvoiceAutomatically);

// Route to download an invoice PDF
router.get('/download/:invoiceId', getInvoiceDownloadUrl);

export default router;
