import { VendorStatus as SharedVendorStatus } from '@shared/types';
import { Prisma, VendorStatus as PrismaVendorStatus } from '@prisma/client';

export interface CreateVendorDto {
  businessName: string;    // vendor/store name
  name: string;
  email: string;
  password: string;        // ✅ required for registration
  phone?: string;
  userId?: string;
  status?: SharedVendorStatus;
  documents?: string[];
  address?: string;
  gstNumber?: string;
  profileImage?: string;
}

export interface UpdateVendorDto extends Partial<CreateVendorDto> {}

export interface UpdateVendorStatusDto {
  status: SharedVendorStatus;
}

/**
 * Convert CreateVendorDto to Prisma.VendorCreateInput
 */
export const createVendorDtoToPrisma = (
  dto: CreateVendorDto
): Prisma.VendorCreateInput => {
  const data: Prisma.VendorCreateInput = {
    businessName: dto.businessName,
    name: dto.name,
    email: dto.email,
    password: dto.password, // ✅ hashed in service before saving
    phone: dto.phone ?? null,
    kycDocsUrl: dto.documents ?? [],
    status: (dto.status ?? SharedVendorStatus.PENDING) as unknown as PrismaVendorStatus,
    address: dto.address ?? null,
    gstNumber: dto.gstNumber ?? null,
    profileImage: dto.profileImage ?? null,
  };

  if (dto.userId) {
    data.user = {
      connect: {
        id: dto.userId,
      },
    };
  }

  return data;
};
