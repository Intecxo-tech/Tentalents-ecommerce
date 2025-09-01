import { sendEmail } from './send';
import { EmailPayload } from './send';

export const sendEmailService = async (data: EmailPayload) => {
  await sendEmail(data);
};
