// shared/email/types.ts
export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  attachments?: { filename: string; path: string }[];
}
