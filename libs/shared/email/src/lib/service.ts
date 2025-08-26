import { sendEmail } from '@shared/middlewares/email/src/lib/send';
import { EmailPayload } from '@shared/middlewares/email/src/lib/send';

export const sendEmailService = async (data: EmailPayload) => {
  await sendEmail(data);
};
