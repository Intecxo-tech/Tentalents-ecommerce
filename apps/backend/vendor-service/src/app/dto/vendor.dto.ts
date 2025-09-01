import { z } from 'zod';
import { VendorStatus as SharedVendorStatus } from '@shared/types';

// ---------------- Zod Schemas ----------------
export const CreateVendorSchema = z.object({
  businessName: z.string(),
  name: z.string(),
  email: z.string().email(),
  password: z.string(),
  phone: z.string().optional(),
  userId: z.string().optional(),
  status: z.nativeEnum(SharedVendorStatus).optional(),
  documents: z.array(z.string()).optional(),
  address: z.string().optional(),
  gstNumber: z.string().optional(),
  profileImage: z.string().url().optional(),
});

export const UpdateVendorSchema = CreateVendorSchema.partial();

export const UpdateVendorStatusSchema = z.object({
  status: z.nativeEnum(SharedVendorStatus),
});

// ---------------- TypeScript DTOs ----------------
export type CreateVendorDto = z.infer<typeof CreateVendorSchema>;
export type UpdateVendorDto = z.infer<typeof UpdateVendorSchema>;
export type UpdateVendorStatusDto = z.infer<typeof UpdateVendorStatusSchema>;
