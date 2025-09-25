import { AuthPayload } from './types'; // ✅ path relative to your middlewares folder

declare global {
  namespace Express {
    // Augment the Request type to include user
    interface Request {
      user?: AuthPayload;
    }
  }
}
