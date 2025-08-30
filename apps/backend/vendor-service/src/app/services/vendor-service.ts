import { VendorStatus as PrismaVendorStatus, PrismaClient, Prisma, UserRole } from '@prisma/client';
import { produceKafkaEvent } from '@shared/kafka';
import  { generateTokenForEmail } from '@shared/auth';
import {admin} from '@shared/auth';
import { SERVICE_NAMES } from '@shared/constants';
import { VendorStatus } from '@shared/types';
import { KAFKA_TOPICS } from '@shared/kafka';
import { hashPassword, comparePassword, generateJWT } from '@shared/auth';
import { VendorCreatedEvent, VendorStatusUpdatedEvent } from '@shared/kafka';
import { logger } from '@shared/logger';
import { sendEmail } from '@shared/email';
const prisma = new PrismaClient();
import {uploadToCloudinary} from '@shared/auth'
import * as crypto from 'crypto';
export const vendorService = {
initiateVendorRegistrationOtp: async (email: string) => {
  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) throw new Error('User already exists');

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiry

    
    await prisma.pendingUserOtp.upsert({
      where: { email },
      update: { otp, expiresAt },
      create: { email, otp, expiresAt },
    });

    // ✅ Send OTP email
    await sendEmail({
      to: email,
      subject: 'Your Vendor OTP Code',
      html: `<p>Your OTP is: <strong>${otp}</strong>. It expires in 5 minutes.</p>`,
    });

    logger.info(`[VendorService] ✅ OTP sent to ${email}`);
    return { message: 'OTP sent to email' };
  } catch (err) {
    logger.error('[VendorService] ❌ initiateVendorRegistrationOtp error:', err);
    throw err;
  }
},
  // Step 2: Verify OTP
  verifyVendorEmailOtp: async (email: string, otp: string) => {
    const record = await prisma.pendingUserOtp.findUnique({ where: { email } });
    if (!record || record.otp !== otp || record.expiresAt < new Date()) {
      throw new Error('Invalid or expired OTP');
    }
    logger.info(`[VendorService] OTP verified for ${email}`);
    return { verified: true };
  },

  // Step 3: Complete vendor user registration (email + password)
completeVendorUserRegistration: async (email: string, password: string) => {
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) throw new Error('User already exists');

  const otpRecord = await prisma.pendingUserOtp.findUnique({ where: { email } });
  if (!otpRecord || otpRecord.expiresAt < new Date()) {
    throw new Error('OTP verification expired or not found');
  }

  const hashedPassword = await hashPassword(password);

  // Create only the user with buyer role (no vendor creation here)
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      role: UserRole.buyer,
    },
  });

  await prisma.pendingUserOtp.delete({ where: { email } });

  const token = generateJWT({ userId: user.id, email: user.email, role: user.role });

  logger.info(`[VendorService] User created (buyer role) for ${email}`);
  return { token, userId: user.id, email: user.email, role: user.role };
},


completeVendorProfileRegistration: async (
  userId: string,
  vendorData: Omit<
    Prisma.VendorCreateInput, 
    'userId' | 'status' | 'kycDocsUrl' | 'bankDetail'
  > & { panNumber: string }, // enforce mandatory panNumber here
  bankData: Omit<Prisma.BankDetailCreateInput, 'vendorId'>,
  kycFiles?: Buffer[],
  kycFilenames?: string[],
  produceEvents: boolean = true  // <-- new optional param with default true
) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('User not found');

  if (!vendorData.name || !vendorData.businessName || !vendorData.panNumber) {
    throw new Error('Missing mandatory vendor fields: name, businessName, or panNumber');
  }

  let kycDocsUrls: string[] = [];

  if (kycFiles && kycFiles.length > 0) {
    kycDocsUrls = await Promise.all(
      kycFiles.map((fileBuffer, index) =>
        uploadToCloudinary(fileBuffer, 'vendor_kyc_documents', kycFilenames?.[index])
      )
    );
  }

  const vendorCreateData: Prisma.VendorCreateInput = {
    ...vendorData,
    user: { connect: { id: userId } },
    status: PrismaVendorStatus.pending,
  };

  if (kycDocsUrls.length > 0) {
    vendorCreateData.kycDocsUrl = kycDocsUrls;
  }

  const vendor = await prisma.vendor.create({
    data: vendorCreateData,
  });

  await prisma.bankDetail.create({
    data: {
      ...bankData,
      vendor: { connect: { id: vendor.id } },
    },
  });


  logger.info(`[VendorService] Vendor profile created for user: ${userId}`);

  return vendor;
},



  async updateStatus(id: string, status: PrismaVendorStatus) {
    const vendor = await prisma.vendor.update({
      where: { id },
      data: {
        status: { set: status },
      },
    });

    const event: VendorStatusUpdatedEvent = {
      vendorId: vendor.id,
      status: vendor.status as VendorStatus,
      updatedAt: vendor.updatedAt.toISOString(),
    };

    await produceKafkaEvent({
      topic: KAFKA_TOPICS.VENDOR.STATUS_UPDATED,
      messages: [{ value: JSON.stringify(event) }],
    });

    logger.info(`[${SERVICE_NAMES.VENDOR}] Vendor status updated: ${vendor.id}`);
    return vendor;
  },
updateVendorBankDetails: async (vendorId: string, bankUpdateData: Partial<Prisma.BankDetailUpdateInput>) => {
  try {
    const existingBank = await prisma.bankDetail.findFirst({ where: { vendorId } });
    if (!existingBank) throw new Error('Bank details not found for vendor');

    const updatedBank = await prisma.bankDetail.update({
      where: { id: existingBank.id },
      data: bankUpdateData,
    });

    logger.info(`[VendorService] Bank details updated for vendorId: ${vendorId}`);
    return updatedBank;
  } catch (err) {
    logger.error('[VendorService] updateVendorBankDetails error:', err);
    throw err;
  }
},

  handleUserBecameVendor: async (event: { userId: string; email: string; phone: string; altphone?: string }) => {
  
    const { userId, email, phone, altphone } = event;
  const gravatarUrl = `https://gravatar.com/avatar/${crypto.createHash('md5').update(email).digest('hex')}?d=identicon`;
    const existingVendor = await prisma.vendor.findFirst({ where: { userId } });
    if (existingVendor) {
      logger.info(`[${SERVICE_NAMES.VENDOR}] Vendor already exists for user: ${userId}`);
      return;
    }

    const vendor = await prisma.vendor.create({
      data: {
        user: { connect: { id: userId } },
        email,
        phone,
        name: '',          // Can be updated later
        businessName: '',  // Optional until vendor completes profile
        status: PrismaVendorStatus.pending,
          profileImage: gravatarUrl,
      },
    });

    // Emit Kafka events
    const createdEvent: VendorCreatedEvent = {
      vendorId: vendor.id,
      name: vendor.name,
      status: vendor.status as VendorStatus,
      createdAt: vendor.createdAt.toISOString(),
    };

    const statusUpdatedEvent: VendorStatusUpdatedEvent = {
      vendorId: vendor.id,
      status: vendor.status as VendorStatus,
      updatedAt: vendor.createdAt.toISOString(),
    };

    await Promise.all([
      produceKafkaEvent({
        topic: KAFKA_TOPICS.VENDOR.CREATED,
        messages: [{ value: JSON.stringify(createdEvent) }],
      }),
      produceKafkaEvent({
        topic: KAFKA_TOPICS.VENDOR.STATUS_UPDATED,
        messages: [{ value: JSON.stringify(statusUpdatedEvent) }],
      }),
    ]);

    logger.info(`[${SERVICE_NAMES.VENDOR}] 🏪 Vendor created for user: ${userId}`);
  },
loginVendorUser: async (email: string, password: string) => {
  try {
    logger.info('[VendorService] 🔑 Login attempt for vendor email:', email);

    // 1. Find vendor by email
   const vendor = await prisma.vendor.findUnique({ where: { email } });
if (!vendor) {
  throw new Error('Invalid credentials');
}

if (!vendor.password) {
  throw new Error('This vendor account does not have a password set.');
}

const isValid = await comparePassword(password, vendor.password);
if (!isValid) {
  throw new Error('Invalid credentials');
}

// Check userId is not null before query
if (!vendor.userId) {
  throw new Error('Vendor has no linked userId');
}

const user = await prisma.user.findUnique({ where: { id: vendor.userId } });
if (!user) {
  throw new Error('Linked user not found');
}

    // 5. Generate a JWT token with vendor info and user info
    // Include vendorId so token can be used for vendor-specific auth
    const tokenPayload = {
      userId: user.id,
      vendorId: vendor.id,
      email: user.email,
      role: user.role,   // Could be UserRole.vendor if you want
    };
    const token = generateJWT(tokenPayload);

    logger.info(`[VendorService] Vendor user logged in: ${email}`);

    // 6. Return token and user/vendor info
    return {
      token,
      userId: user.id,
        email: user.email ?? undefined,
      role: user.role,
      vendorId: vendor.id,
      vendorStatus: vendor.status,
    };
  } catch (err) {
    logger.error('[VendorService] loginVendorUser error:', err);
    throw err;
  }
},


 // 1. Initiate forgot password OTP
  initiateForgotPasswordOtp: async (email: string) => {
    try {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) throw new Error('User not found');

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins expiry

      await prisma.pendingUserOtp.upsert({
        where: { email },
        update: { otp, expiresAt },
        create: { email, otp, expiresAt },
      });

      await sendEmail({
        to: email,
        subject: 'Your Password Reset OTP',
        html: `<p>Your password reset OTP is <strong>${otp}</strong>. It expires in 5 minutes.</p>`,
      });

      logger.info(`[VendorService] Password reset OTP sent to ${email}`);
      return { message: 'OTP sent to email' };
    } catch (err) {
      logger.error('[VendorService] initiateForgotPasswordOtp error:', err);
      throw err;
    }
  },

  // 2. Verify forgot password OTP
  verifyForgotPasswordOtp: async (email: string, otp: string) => {
    try {
      const record = await prisma.pendingUserOtp.findUnique({ where: { email } });
      if (!record || record.otp !== otp || record.expiresAt < new Date()) {
        throw new Error('Invalid or expired OTP');
      }
      logger.info(`[VendorService] Password reset OTP verified for ${email}`);
      return { verified: true };
    } catch (err) {
      logger.error('[VendorService] verifyForgotPasswordOtp error:', err);
      throw err;
    }
  },

  // 3. Reset password with OTP
  resetPasswordWithOtp: async (email: string, otp: string, newPassword: string) => {
    try {
      const record = await prisma.pendingUserOtp.findUnique({ where: { email } });
      if (!record || record.otp !== otp || record.expiresAt < new Date()) {
        throw new Error('Invalid or expired OTP');
      }

      const hashedPassword = await hashPassword(newPassword);

      await prisma.user.update({
        where: { email },
        data: { password: hashedPassword },
      });

      await prisma.pendingUserOtp.delete({ where: { email } });

      logger.info(`[VendorService] Password reset successful for ${email}`);
      return { message: 'Password reset successful' };
    } catch (err) {
      logger.error('[VendorService] resetPasswordWithOtp error:', err);
      throw err;
    }
  },
getByVendorId: async (vendorId: string) => {
  try {
    if (!vendorId) throw new Error('Vendor ID is required');

    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          }
        },
      },
    });

    if (!vendor) {
      throw new Error('Vendor not found');
    }

    logger.info(`[VendorService] Vendor profile fetched for vendorId: ${vendorId}`);

    // Optional: Return a DTO hiding sensitive info like passwords
    return {
      id: vendor.id,
      email: vendor.email,
      name: vendor.name,
      phone: vendor.phone,
      businessName: vendor.businessName,
      status: vendor.status,
      createdAt: vendor.createdAt,
      updatedAt: vendor.updatedAt,
      user: vendor.user,
    };
  } catch (err) {
    logger.error('[VendorService] getByVendorId error:', err);
    throw err;
  }
},

updateVendorProfile: async (
  vendorId: string,
  updateData: Partial<Omit<Prisma.VendorUpdateInput, 'id' | 'user'>>
) => {
  try {
    // Directly update whatever fields the user passes
    const vendor = await prisma.vendor.update({
      where: { id: vendorId },
      data: updateData,
    });

    logger.info(`[VendorService] Vendor profile updated for vendorId: ${vendorId}`);
    return vendor;
  } catch (err) {
    logger.error('[VendorService] updateVendorProfile error:', err);
    throw err;
  }
},

loginOrRegisterWithGoogleIdToken: async (idToken: string) => {
  try {
    // Verify Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(idToken);

    const email = decodedToken.email;
    if (!email) {
      throw new Error('Firebase token does not contain an email');
    }

    // Check if user exists
    let user = await prisma.user.findUnique({ where: { email } });
const gravatarUrl = `https://gravatar.com/avatar/${crypto.createHash('md5').update(email).digest('hex')}?d=identicon`;
    if (!user) {
      // Create new user with seller role
      user = await prisma.user.create({
        data: {
          email,
          role: UserRole.seller,
        },
      });

      // Create linked vendor profile
      await prisma.vendor.create({
        data: {
          user: { connect: { id: user.id } },
          email,
          name: decodedToken.name ?? '',
          phone: decodedToken.phone_number ?? '',
          businessName: '',
          status: PrismaVendorStatus.pending,
           profileImage: gravatarUrl,
        },
      });

      logger.info(`[VendorService] New user and vendor created from Google login: ${email}`);
    }

    // Fetch linked vendor if exists
    const vendor = await prisma.vendor.findFirst({ where: { userId: user.id } });

    // Prepare JWT payload with user and vendor info
    const tokenPayload = {
      userId: user.id,
      vendorId: vendor?.id,
      email: user.email,
      role: user.role,
    };

    // Generate JWT token
logger.info(`Token payload: ${JSON.stringify(tokenPayload)}`);
const token = generateJWT(tokenPayload);
logger.info(`Generated JWT: ${token}`);

    logger.info(`[VendorService] Google login successful for ${email}`);

return {
  token,
  userId: user.id,
  email: user.email,
  role: user.role,
  vendorId: vendor?.id,
  vendorStatus: vendor?.status,
};

  } catch (error) {
    logger.error('[VendorService] loginOrRegisterWithGoogleIdToken error:', error);
    throw error;
  }
},
uploadVendorProfileImage: async (vendorId: string, file: Express.Multer.File): Promise<string> => {
  try {
    if (!vendorId || !file) throw new Error('Vendor ID and file are required');

    logger.info(`[VendorService] Starting upload for vendorId: ${vendorId}`);

    // Upload image buffer to Cloudinary under 'vendor_profiles' folder
    const uploadedImageUrl = await uploadToCloudinary(
      file.buffer,
      'vendor_profiles',
      `vendor_${vendorId}`
    );

    logger.info(`[VendorService] Uploaded image to Cloudinary: ${uploadedImageUrl}`);

    // Update vendor's profileImage in DB
    await prisma.vendor.update({
      where: { id: vendorId },
      data: { profileImage: uploadedImageUrl },
    });

    logger.info(`[VendorService] Updated profileImage in DB for vendor ${vendorId}`);

    return uploadedImageUrl;
  } catch (err: any) {
    logger.error('[VendorService] uploadVendorProfileImage error:', err.message || err);
    throw err;
  }
},

uploadVendorKYCDocuments: async (vendorId: string, files: Buffer[], filenames?: string[]) => {
  try {
    const uploadPromises = files.map((fileBuffer, index) =>
      uploadToCloudinary(fileBuffer, 'vendor_kyc_documents', filenames?.[index])
    );

    const urls = await Promise.all(uploadPromises);

    const vendor = await prisma.vendor.findUnique({ where: { id: vendorId } });
    if (!vendor) throw new Error('Vendor not found');

    const existingDocs: string[] = vendor.kycDocsUrl ?? [];

    const updatedVendor = await prisma.vendor.update({
      where: { id: vendorId },
      data: {
        kycDocsUrl: [...existingDocs, ...urls],
      },
    });

    logger.info(`[VendorService] KYC documents uploaded for vendorId: ${vendorId}`);
    return updatedVendor;
  } catch (error) {
    logger.error('[VendorService] uploadVendorKYCDocuments error:', error);
    throw error;
  }
},

};