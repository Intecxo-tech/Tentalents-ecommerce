import { CreateVendorDto, UpdateVendorDto, UpdateVendorStatusDto } from '../dto/vendor.dto';
import { VendorStatus } from '@shared/types';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { env } from '@shared/config';
import { logger } from '@shared/logger';

const prisma = new PrismaClient();

export const vendorService = {
  // ---------------- JWT ----------------
  verifyJwtToken(token: string) {
    return jwt.verify(token, env.JWT_SECRET) as any;
  },

  generateJwtToken(payload: { userId: string; role: string }) {
    return jwt.sign(payload, env.JWT_SECRET, { expiresIn: '7d' });
  },

  // ---------------- OTP ----------------
  async initiateVendorRegistrationOtp(email: string) {
    // implement OTP generation & email sending
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    logger.info(`OTP for ${email}: ${otp}`);
    return { success: true, otp };
  },

  async verifyVendorEmailOtp(email: string, otp: string) {
    // implement OTP verification
    return { success: true, message: 'OTP verified' };
  },

  // ---------------- REGISTRATION ----------------
  async completeVendorUserRegistration(vendorDto: CreateVendorDto & { bankDetail?: any }) {
    const hashedPassword = await bcrypt.hash(vendorDto.password, 10);

    const createdVendor = await prisma.vendor.create({
      data: {
        ...vendorDto,
        password: hashedPassword,
        status: vendorDto.status || VendorStatus.PENDING,
        bankDetail: vendorDto.bankDetail
          ? {
              create: vendorDto.bankDetail,
            }
          : undefined,
      },
      include: {
        bankDetail: true,
      },
    });

    return createdVendor;
  },

  // ---------------- LOGIN ----------------
  async loginVendorUser(email: string, password: string) {
    const vendor = await prisma.vendor.findUnique({ where: { email }, include: { bankDetail: true } });
    if (!vendor || !vendor.password) throw new Error('Invalid credentials');

    const isValid = await bcrypt.compare(password, vendor.password);
    if (!isValid) throw new Error('Invalid credentials');

    const token = this.generateJwtToken({ userId: vendor.id, role: 'vendor' });
    return { vendor, token };
  },

  // ---------------- PROFILE ----------------
  async getByVendorId(vendorId: string) {
    return prisma.vendor.findUnique({
      where: { id: vendorId },
      include: { bankDetail: true },
    });
  },

  async updateVendorProfile(vendorId: string, updateData: UpdateVendorDto) {
    // Extract bankDetail if present
    const { bankDetail, ...vendorFields } = updateData as any;

    const updatedVendor = await prisma.vendor.update({
      where: { id: vendorId },
      data: {
        ...vendorFields,
        bankDetail: bankDetail
          ? {
              upsert: {
                create: bankDetail,
                update: bankDetail,
              },
            }
          : undefined,
      },
      include: { bankDetail: true },
    });

    return updatedVendor;
  },

  // ---------------- VENDOR STATUS ----------------
  async updateStatus(vendorId: string, status: VendorStatus) {
    return prisma.vendor.update({
      where: { id: vendorId },
      data: { status },
      include: { bankDetail: true },
    });
  },

  // ---------------- PROFILE IMAGE ----------------
  async uploadVendorProfileImage(vendorId: string, buffer: Buffer, filename: string, mimetype: string) {
    // Replace with your storage logic (S3/MinIO/Cloudinary)
    const uploadedUrl = `https://cdn.example.com/vendors/${vendorId}/${filename}`;
    return prisma.vendor.update({
      where: { id: vendorId },
      data: { profileImage: uploadedUrl },
      include: { bankDetail: true },
    });
  },
};
