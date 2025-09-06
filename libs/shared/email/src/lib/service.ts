// shared/email/service.ts
import { sendEmail } from './client';
import { EmailPayload } from './types';

export const sendEmailService = async (payload: EmailPayload) => {
  return await sendEmail(payload);
};
