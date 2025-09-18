// libs/shared/email/types.ts
export interface EmailAttachment {
  filename: string;
  content: Buffer | string;
  contentType?: string;
}

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  text?: string;                 // ✅ Optional plain-text version
  attachments?: EmailAttachment[]; // ✅ Allow PDF or other files
}
