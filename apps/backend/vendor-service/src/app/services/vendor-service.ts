import bcrypt from 'bcryptjs';
import { PrismaClient, VendorStatus as PrismaVendorStatus } from '@prisma/client';
import { sendEmail, EmailPayload } from '@shared/email';
import { logger } from '@shared/logger';
import { produceKafkaEvent, KAFKA_TOPICS } from '@shared/kafka';
import { uploadToCloudinary } from '@shared/auth';
import { generateJWT, verifyToken } from '@shared/auth';
import { redisClient } from '@shared/redis';
import type { VendorStatus } from '@shared/types';
import type { CreateVendorDto, UpdateVendorDto } from '../dto/vendor.dto';

const prisma = new PrismaClient();

export class VendorService {
  /* ---------------------- VENDOR PROFILE ---------------------- */
  async getByVendorId(vendorId: string) {
    return prisma.vendor.findUnique({ where: { id: vendorId } });
  }

  async updateVendorProfile(vendorId: string, data: UpdateVendorDto) {
    return prisma.vendor.update({ where: { id: vendorId }, data });
  }

  /* ---------------------- VENDOR PROFILE IMAGE ---------------------- */
  async uploadVendorProfileImage(
    vendorId: string,
    fileBuffer: Buffer,
    filename: string,
    mimeType: string
  ) {
    const imageUrl = await uploadToCloudinary(fileBuffer, `vendor/${vendorId}/profile`, filename, mimeType);
    return prisma.vendor.update({ where: { id: vendorId }, data: { profileImage: imageUrl } });
  }

  /* ---------------------- VENDOR STATUS ---------------------- */
  async updateStatus(id: string, status: VendorStatus) {
    const prismaStatus = status.toLowerCase() as PrismaVendorStatus;
    return prisma.vendor.update({ where: { id }, data: { status: prismaStatus } });
  }

  /* ---------------------- BANK DETAILS ---------------------- */
  async updateBankDetails(vendorId: string, bankData: any, cancelledChequeFile?: Buffer) {
    let chequeUrl;
    if (cancelledChequeFile) {
      chequeUrl = await uploadToCloudinary(cancelledChequeFile, `vendor/${vendorId}/bank`, 'cancelled_cheque', 'application/pdf');
    }
    return prisma.vendor.update({ where: { id: vendorId }, data: { ...bankData, cancelledChequeUrl: chequeUrl } });
  }

  /* ---------------------- KYC DOCUMENTS ---------------------- */
  async uploadVendorKYCDocuments(vendorId: string, files: { buffer: Buffer; filename: string; mimeType: string }[]) {
    const urls = await Promise.all(files.map(file => uploadToCloudinary(file.buffer, `vendor/${vendorId}/kyc`, file.filename, file.mimeType)));
    return prisma.vendor.update({ where: { id: vendorId }, data: { kycDocsUrl: urls } });
  }

  /* ---------------------- AUTHENTICATION & OTP ---------------------- */
  async initiateVendorRegistrationOtp(email: string) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const payload: EmailPayload = { to: email, subject: 'Your Vendor Registration OTP', html: `<p>Your OTP is <b>${otp}</b></p>` };
    await sendEmail(payload);
    await redisClient.set(`vendor:otp:${email}`, otp, { EX: 300 });
    logger.info(`OTP sent to ${email}: ${otp}`);
    return { message: `OTP sent to ${email}` };
  }

  async verifyVendorEmailOtp(email: string, otp: string) {
    const storedOtp = await redisClient.get(`vendor:otp:${email}`);
    if (!storedOtp) throw new Error('OTP expired or not found');
    if (storedOtp !== otp) throw new Error('Invalid OTP');
    await redisClient.del(`vendor:otp:${email}`);
    return { message: 'OTP verified successfully' };
  }

  async completeVendorUserRegistration(createVendorDto: CreateVendorDto) {
    try {
      const hashedPassword = await bcrypt.hash(createVendorDto.password!, 10);
      const vendor = await prisma.vendor.create({
        data: {
          email: createVendorDto.email,
          password: hashedPassword,
          status: PrismaVendorStatus.pending,
          name: createVendorDto.name,
          businessName: createVendorDto.businessName,
          phone: createVendorDto.phone,
          address: createVendorDto.address,
        },
      });

      await produceKafkaEvent({
        topic: KAFKA_TOPICS.VENDOR.CREATED,
        messages: [{ key: vendor.id, value: JSON.stringify({ vendorId: vendor.id, email: vendor.email, status: vendor.status }) }],
      });

      return { message: 'Vendor registered successfully', vendorId: vendor.id };
    } catch (err) {
      logger.error('Vendor registration failed', err);
      throw new Error(`Vendor registration failed: ${(err as Error).message}`);
    }
  }

  async loginVendorUser(email: string, password: string) {
    const vendor = await prisma.vendor.findUnique({ where: { email } });
    if (!vendor || !vendor.password) throw new Error('Invalid credentials');

    const isMatch = await bcrypt.compare(password, vendor.password);
    if (!isMatch) throw new Error('Invalid credentials');

    const token = generateJWT({ userId: vendor.id, email: vendor.email, role: 'vendor', vendorId: vendor.id });
    return { token };
  }

  async loginOrRegisterWithGoogleIdToken(idToken: string) {
    // Implement Google OAuth login logic if required
    return { token: 'jwt-token' };
  }

  /* ---------------------- JWT VERIFICATION ---------------------- */
  verifyJwtToken(token: string) {
    try {
      return verifyToken(token); // Returns AuthPayload
    } catch (err) {
      throw new Error('Invalid or expired token');
    }
  }

  /* ---------------------- USER TO VENDOR CONVERSION ---------------------- */
  async handleUserBecameVendor(userData: { userId: string; email: string; phone: string }) {
    return { message: 'User converted to vendor' };
  }
}

export const vendorService = new VendorService();
