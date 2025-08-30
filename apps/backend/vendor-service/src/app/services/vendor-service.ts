import { PrismaClient, VendorStatus as PrismaVendorStatus } from '@prisma/client';
import { logger } from '@shared/logger';
import { produceKafkaEvent, KAFKA_TOPICS } from '@shared/kafka';
import { uploadToCloudinary } from '@shared/auth';
import type { VendorStatus } from '@shared/types'; // ✅ fixed
import type { CreateVendorDto, UpdateVendorDto, UpdateVendorStatusDto } from '../dto/vendor.dto';

const prisma = new PrismaClient();

export class VendorService {
  /* ---------------------- VENDOR PROFILE ---------------------- */
  async getByVendorId(vendorId: string) {
    return prisma.vendor.findUnique({ where: { id: vendorId } });
  }

  async updateVendorProfile(vendorId: string, data: UpdateVendorDto) {
    return prisma.vendor.update({ where: { id: vendorId }, data });
  }

  /* ---------------------- VENDOR STATUS ---------------------- */
  async updateStatus(id: string, status: VendorStatus) {
    // Convert to Prisma enum type
    const prismaStatus = status.toLowerCase() as PrismaVendorStatus;
    return prisma.vendor.update({
      where: { id },
      data: { status: prismaStatus },
    });
  }

  /* ---------------------- BANK DETAILS ---------------------- */
  async updateBankDetails(vendorId: string, bankData: any, cancelledChequeFile?: Buffer) {
    let chequeUrl;
    if (cancelledChequeFile) {
      chequeUrl = await uploadToCloudinary(
        cancelledChequeFile,
        `vendor/${vendorId}/bank`,
        'cancelled_cheque',
        'application/pdf'
      );
    }

    return prisma.vendor.update({
      where: { id: vendorId },
      data: { ...bankData, cancelledChequeUrl: chequeUrl },
    });
  }

  /* ---------------------- KYC DOCUMENTS ---------------------- */
  async uploadVendorKYCDocuments(vendorId: string, files: { buffer: Buffer; filename: string; mimeType: string }[]) {
    const urls = await Promise.all(
      files.map((file) =>
        uploadToCloudinary(file.buffer, `vendor/${vendorId}/kyc`, file.filename, file.mimeType)
      )
    );

    return prisma.vendor.update({
      where: { id: vendorId },
      data: { kycDocsUrl: urls },
    });
  }

  /* ---------------------- AUTHENTICATION & OTP ---------------------- */
  async initiateVendorRegistrationOtp(email: string) {
    // implement your OTP logic
    return { message: `OTP sent to ${email}` };
  }

  async verifyVendorEmailOtp(email: string, otp: string) {
    // implement your OTP verification logic
    return { message: 'OTP verified successfully' };
  }

  async completeVendorUserRegistration(email: string, password: string) {
    // implement your vendor user creation
    return { message: 'Vendor user registered successfully' };
  }

  async loginVendorUser(email: string, password: string) {
    // implement login logic
    return { token: 'jwt-token' };
  }

  async loginOrRegisterWithGoogleIdToken(idToken: string) {
    // implement Google login logic
    return { token: 'jwt-token' };
  }

  /* ---------------------- CONVERSION ---------------------- */
  async handleUserBecameVendor(userData: { userId: string; email: string; phone: string; altphone?: string }) {
    // implement user to vendor conversion
    return { message: 'User converted to vendor' };
  }
}

// ✅ Export a single instance
export const vendorService = new VendorService();
