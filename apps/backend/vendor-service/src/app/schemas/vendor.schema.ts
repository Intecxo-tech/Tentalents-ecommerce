// apps/vendor-service/src/app/dto/vendor.dto.ts
import { z } from 'zod';
import { VendorStatus } from '@shared/types';

export const CreateVendorSchema = z.object({
    name: z.string(),
  email: z.string().email(),
  phone: z.string(),
  userId: z.string().optional(), 
  businessName: z.string(),
  storeSlug: z.string().optional(),
  status: z.nativeEnum(VendorStatus).optional(),
  documents: z.array(z.string()).optional(),
  address: z.string().optional(),
  gstNumber: z.string().optional(),
  profileImage: z.string().url().optional(),
   panNumber: z.string().optional(),
  AadharNumber: z.string().optional(),
});

export const UpdateVendorSchema = CreateVendorSchema.partial();

export const UpdateVendorStatusSchema = z.object({
  id: z.string(), // required for update
  status: z.nativeEnum(VendorStatus),
});

// ✅ Export DTO types from Zod schemas
export type CreateVendorDto = z.infer<typeof CreateVendorSchema>;
export type UpdateVendorDto = z.infer<typeof UpdateVendorSchema>;
export type UpdateVendorStatusDto = z.infer<typeof UpdateVendorStatusSchema>;
