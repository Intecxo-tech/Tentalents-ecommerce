import { ReturnStatus } from '@shared/types';
import { VendorStatus as SharedVendorStatus } from '@shared/types';
import { Prisma, VendorStatus as PrismaVendorStatus } from '@prisma/client';

export interface CreateVendorDto {
  businessName: string;  // rename from storeName
  name: string;
  email: string;
  phone?: string;
  userId?: string;
  status?: SharedVendorStatus;
  documents?: string[];
  address?: string;
  gstNumber?: string;
  profileImage?: string;
  panNumber?: string;
  AadharNumber?: string;
}

export interface UpdateVendorDto extends Partial<CreateVendorDto> {}

export interface UpdateVendorStatusDto {
  status: SharedVendorStatus;
}


// ✅ Return request DTO
export interface UpdateReturnRequestDto {
  status?: ReturnStatus;
  comment?: string;
  replacementProductId?: string;
  attachmentUrls?: string[];
}

export const createVendorDtoToPrisma = (
  dto: CreateVendorDto
): Prisma.VendorCreateInput => {
  const data: Prisma.VendorCreateInput = {
    businessName: dto.businessName,
    name: dto.name,
    email: dto.email,
    phone: dto.phone ?? null,
    kycDocsUrl: dto.documents ?? [],
    status: (dto.status ?? SharedVendorStatus.PENDING) as unknown as PrismaVendorStatus,
    address: dto.address ?? null,
    gstNumber: dto.gstNumber ?? null,
    AadharNumber: dto.AadharNumber ?? null,
    panNumber: dto.panNumber ?? null,
    profileImage: dto.profileImage ?? null,
  };

  if (dto.userId) {
    data.user = { connect: { id: dto.userId } };
  }

  return data;
};