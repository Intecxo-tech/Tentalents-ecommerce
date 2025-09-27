import { VendorStatus } from './enums/vendor-status.enum';

export interface Vendor {
  id: string;
  storeName: string;
  storeSlug: string;
  name: string;
  email: string;
  phone: string;
  userId: string;
  documents: string[];
  status: VendorStatus;
  createdAt: string;
  updatedAt: string;
}

export interface VendorCreatedEvent {
  vendorId: string;
  userId: string;
  email: string;
  status: VendorStatus;
  createdAt: string;
}

export interface VendorStatusUpdatedEvent {
  vendorId: string;
  newStatus: VendorStatus;
  updatedAt: string;
}


// ------------------- Return Request -------------------
export enum ReturnStatus {
  REQUESTED = 'REQUESTED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum ReturnPolicyType {
  REFUND = 'REFUND',
  REPLACEMENT = 'REPLACEMENT',
}

export interface ReturnRequest {
  id: string;
  orderItemId: string;
  userId: string;
  orderId: string;
  reason: string;
  status: ReturnStatus;
  returnType: ReturnPolicyType;
  replacementProductId?: string;
  comment?: string;
  attachmentUrls?: string[];
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
}

// ✅ Update DTO
export interface UpdateReturnRequestDto {
  status?: ReturnStatus;
  comment?: string;
  replacementProductId?: string;
  attachmentUrls?: string[];
}