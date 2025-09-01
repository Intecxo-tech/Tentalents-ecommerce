import { z } from 'zod';
import { VendorStatus as SharedVendorStatus } from '@shared/types';

// ---------------- Nested Bank Detail Schema ----------------
export const BankDetailSchema = z.object({
  accountHolder: z.string(),
  accountNumber: z.string(),
  ifscCode: z.string(),
  bankName: z.string(),
  branchName: z.string().optional(),
  upiId: z.string().optional(),
});

// ---------------- Zod Schemas ----------------
export const CreateVendorSchema = z.object({
  businessName: z.string(),
  name: z.string(),
  email: z.string().email(),
  password: z.string(),
  phone: z.string().optional(),
  userId: z.string().optional(),
  status: z.nativeEnum(SharedVendorStatus).optional(),
  kycDocsUrl: z.array(z.string()).optional(),
  address: z.string().optional(),
  gstNumber: z.string().optional(),
  profileImage: z.string().url().optional(),
  firebaseUid: z.string().optional(),
  panNumber: z.string().optional(),
  aadharNumber: z.string().optional(),
  bankDetail: BankDetailSchema.optional(),
});

export const UpdateVendorSchema = CreateVendorSchema.partial();

export const UpdateVendorStatusSchema = z.object({
  status: z.nativeEnum(SharedVendorStatus),
});

// ---------------- TypeScript DTOs ----------------
export type CreateVendorDto = z.infer<typeof CreateVendorSchema>;
export type UpdateVendorDto = z.infer<typeof UpdateVendorSchema>;
export type UpdateVendorStatusDto = z.infer<typeof UpdateVendorStatusSchema>;
