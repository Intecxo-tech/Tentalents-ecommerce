import { PrismaClient, UserRole } from '@prisma/client';
import { hashPassword, comparePassword, generateJWT, admin } from '@shared/auth';
import { produceKafkaEvent as publishEvent } from '@shared/kafka';
import { KAFKA_TOPICS } from '@shared/kafka';
import { sendEmail } from '@shared/email';
import { logger } from '@shared/logger';
import * as crypto from 'crypto';
import { uploadToCloudinary } from '@shared/auth';
import { MinioBuckets, uploadFile } from '@shared/minio';

const prisma = new PrismaClient();

interface RegisterUserParams {
  email: string;
  password: string;
  phone: string;
  altphone?: string;
  name: string;
  role?: UserRole;
}

interface LoginUserParams {
  email: string;
  password: string;
}

interface AddressInput {
  name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  country: string;
  pinCode: string;
  addressType: 'home' | 'work';
}

export const userService = {
  // --------------------------
  // OTP Registration
  // --------------------------
  initiateRegistrationOtp: async (email: string) => {
    try {
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) throw new Error('User already exists');

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

      await prisma.pendingUserOtp.upsert({
        where: { email },
        update: { otp, expiresAt },
        create: { email, otp, expiresAt },
      });

      await sendEmail({
        to: email,
        subject: 'Your OTP Code for Registration',
        html: `<p>Your OTP is: <strong>${otp}</strong>. It expires in 5 minutes.</p>`,
      });

      logger.info(`[UserService] OTP sent to ${email}`);
      return { message: 'OTP sent to email' };
    } catch (err: any) {
      logger.error('[UserService] initiateRegistrationOtp error:', err);
      throw err;
    }
  },

  resendRegistrationOtp: async (email: string) => {
    try {
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) throw new Error('User already exists');

      const recentOtp = await prisma.pendingUserOtp.findUnique({ where: { email } });
      if (recentOtp && recentOtp.expiresAt > new Date(Date.now() - 60 * 1000)) {
        throw new Error('Please wait before requesting a new OTP');
      }

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

      await prisma.pendingUserOtp.upsert({
        where: { email },
        update: { otp, expiresAt },
        create: { email, otp, expiresAt },
      });

      await sendEmail({
        to: email,
        subject: 'Your OTP Code for Registration (Resent)',
        html: `<p>Your new OTP is: <strong>${otp}</strong>. It expires in 5 minutes.</p>`,
      });

      logger.info(`[UserService] OTP resent to ${email}`);
      return { message: 'OTP resent to email' };
    } catch (err) {
      logger.error('[UserService] resendRegistrationOtp error:', err);
      throw err;
    }
  },

  verifyEmailOtp: async (email: string, otp: string) => {
    try {
      const record = await prisma.pendingUserOtp.findUnique({ where: { email } });
      if (!record || record.otp !== otp || record.expiresAt < new Date()) {
        throw new Error('Invalid or expired OTP');
      }
      logger.info(`[UserService] OTP verified for ${email}`);
      return { verified: true };
    } catch (err) {
      logger.error('[UserService] verifyEmailOtp error:', err);
      throw err;
    }
  },

  completeRegistration: async ({
    email,
    password,
    name,
    phone,
    altphone,
    role = UserRole.buyer,
  }: RegisterUserParams) => {
    try {
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) throw new Error('User already exists');

      const otpRecord = await prisma.pendingUserOtp.findUnique({ where: { email } });
      if (!otpRecord || otpRecord.expiresAt < new Date()) {
        throw new Error('OTP verification expired or not found');
      }

      const defaultProfileImage = `https://gravatar.com/avatar/${crypto
        .createHash('md5')
        .update(email)
        .digest('hex')}?d=identicon`;

      const hashed = await hashPassword(password);

      const user = await prisma.user.create({
        data: {
          email,
          password: hashed,
          name: name || '',
          phone: phone || '',
          altPhone: altphone || '',
          role,
          profileImage: defaultProfileImage,
        },
      });

      await prisma.pendingUserOtp.delete({ where: { email } });

      // Kafka events
      try {
        const kafkaPayload = { userId: user.id, email: user.email, role: user.role };
        await publishEvent({
          topic: KAFKA_TOPICS.USER.CREATED,
          messages: [{ value: JSON.stringify(kafkaPayload) }],
        });

        await publishEvent({
          topic: KAFKA_TOPICS.EMAIL.USER_CREATED,
          messages: [{ value: JSON.stringify({ email: user.email }) }],
        });

        if (user.role === UserRole.seller) {
          await publishEvent({
            topic: KAFKA_TOPICS.USER.VENDOR_REGISTERED,
            messages: [
              {
                value: JSON.stringify({
                  userId: user.id,
                  email: user.email,
                  phone: user.phone,
                  altphone: user.altPhone,
                  status: 'pending',
                }),
              },
            ],
          });
        }
      } catch (kafkaErr) {
        logger.warn('⚠️ Kafka publishing failed', kafkaErr);
      }

      logger.info(`[UserService] Registration complete for ${email}`);
      return { id: user.id, email: user.email, role: user.role };
    } catch (err) {
      logger.error('[UserService] completeRegistration error:', err);
      throw err;
    }
  },

  // --------------------------
  // Login
  // --------------------------
  loginUser: async ({ email, password }: LoginUserParams) => {
    try {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) throw new Error('Invalid credentials');
      if (!user.password) throw new Error('OAuth account - use Google login');

      const isValid = await comparePassword(password, user.password);
      if (!isValid) throw new Error('Invalid credentials');

      const vendor = await prisma.vendor.findUnique({ where: { userId: user.id } });

      return generateJWT({
        userId: user.id,
        email: user.email,
        role: user.role,
        vendorId: vendor?.id ?? undefined,
      });
    } catch (err) {
      logger.error('[UserService] loginUser error:', err);
      throw err;
    }
  },

  oauthLogin: async (provider: string, idToken: string) => {
    if (provider !== 'google') throw new Error('Unsupported provider');

    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { email, name, picture, uid } = decodedToken;
    if (!email) throw new Error('Email not found in token');

    let user = await prisma.user.findFirst({ where: { firebaseUid: uid } });
    if (!user) user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name: name || '',
          profileImage: picture || '',
          role: UserRole.buyer,
          firebaseUid: uid,
        },
      });

      await publishEvent({
        topic: KAFKA_TOPICS.USER.CREATED,
        messages: [{ value: JSON.stringify({ userId: user.id, email: user.email, role: user.role }) }],
      });
    } else if (!user.firebaseUid) {
      await prisma.user.update({ where: { id: user.id }, data: { firebaseUid: uid } });
    }

    return generateJWT({ userId: user.id, email: user.email, role: user.role });
  },

  // --------------------------
  // Profile
  // --------------------------
  getUserProfile: async (userId: string) => {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        name: true,
        phone: true,
        altPhone: true,
        profileImage: true,
        vendor: { select: { id: true } },
      },
    });
    if (!user) throw new Error('User not found');
    return { ...user, vendorId: user.vendor?.id ?? null };
  },

  updateUserProfile: async (userId: string, updates: { name?: string; phone?: string; altPhone?: string }) => {
    return await prisma.user.update({
      where: { id: userId },
      data: {
        ...(updates.name && { name: updates.name }),
        ...(updates.phone && { phone: updates.phone }),
        ...(updates.altPhone && { altPhone: updates.altPhone }),
      },
      select: { id: true, name: true, phone: true, altPhone: true, email: true, role: true, profileImage: true },
    });
  },

  updateProfileImage: async (userId: string, imageUrl: string) => {
    return await prisma.user.update({ where: { id: userId }, data: { profileImage: imageUrl } });
  },

  uploadImageAndGetUrl: async (userId: string, file: Express.Multer.File) => {
    const uploadedImageUrl = await uploadToCloudinary(file.buffer, 'user_profiles', `user_${userId}`);
    await prisma.user.update({ where: { id: userId }, data: { profileImage: uploadedImageUrl } });
    return uploadedImageUrl;
  },

  updateUserRole: async (userId: string, newRole: UserRole) => {
    return await prisma.user.update({ where: { id: userId }, data: { role: newRole } });
  },

  // --------------------------
  // Address
  // --------------------------
  saveAddress: async (userId: string, input: AddressInput) => {
    return await prisma.address.create({
      data: {
        userId,
        name: input.name,
        phone: input.phone,
        addressLine1: input.line1,
        addressLine2: input.line2 || '',
        city: input.city,
        state: input.state,
        country: input.country,
        pinCode: input.pinCode,
        addressType: input.addressType,
      },
    });
  },
};
