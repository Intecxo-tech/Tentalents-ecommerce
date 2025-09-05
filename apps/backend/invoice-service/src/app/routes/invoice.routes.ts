import { Router } from 'express';
import {
  manualInvoiceGeneration,
  getInvoiceDownloadUrl,
} from '../controllers/invoice.controller';

const router = Router();

router.post('/generate/:orderId', manualInvoiceGeneration);
router.get('/download/:orderId', getInvoiceDownloadUrl);

export default router;
