// General utilities
export * from './lib/env';
export * from './lib/sleep';
export * from './lib/retry';
export * from './lib/uuid';
export * from './lib/formatDate';
export * from './lib/parseJSON';
export * from './lib/hash';
export * from './lib/validator';
export * from './lib/response';
export * from './lib/invoice-generator';


// Firebase utilities

export { adminAuth, firebaseAdmin } from './lib/firebase-admin'; // 🔐 Admin SDK (for backend auth verification)

// Express helper
import { Response } from 'express';

export const sendSuccess = (res: Response, message: string, data: any) => {
  return res.status(200).json({ success: true, message, data });
};
