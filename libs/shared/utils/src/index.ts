export * from './lib/env';
export * from './lib/sleep';
export * from './lib/retry';
export * from './lib/uuid';
export * from './lib/formatDate';
export * from './lib/parseJSON';
export * from './lib/hash';
export * from './lib/validator';
export * from './lib/pdf';
export * from './lib/response';
export * from './lib/invoice-generator';
// libs/shared/utils/src/index.ts

import { Response } from 'express';

export const sendSuccess = (res: Response, message: string, data: any) => {
  return res.status(200).json({ success: true, message, data });
};

// ✅ Benefits: Clean and organized imports like:
