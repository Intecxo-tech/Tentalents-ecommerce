import { sendEmail } from './send';
import { EmailPayload } from './types';

export const sendEmailService = async (data: EmailPayload) => {
  await sendEmail(data);
};
