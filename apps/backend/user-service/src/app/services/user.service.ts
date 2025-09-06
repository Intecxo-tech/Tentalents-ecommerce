import { PrismaClient, UserRole } from '@prisma/client';
import { hashPassword, comparePassword, generateJWT, admin, uploadToCloudinary } from '@shared/auth';
import { produceKafkaEvent as publishEvent, KAFKA_TOPICS } from '@shared/kafka';
import { sendEmail } from '@shared/email';
import { logger } from '@shared/logger';
import * as crypto from 'crypto';
import { Express } from 'express';

const prisma = new PrismaClient();

interface RegisterUserParams {
  email: string;
  password: string;
  phone: string;
  altPhone: string;
  name: string;
  role?: UserRole;
}

interface LoginUserParams {
  email: string;
  password: string;
}

export const userService = {
  // Step 1: Send OTP
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

  // Step 1b: Resend OTP
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
    } catch (err: any) {
      logger.error('[UserService] resendRegistrationOtp error:', err);
      throw err;
    }
  },

  // Step 2: Verify OTP
  verifyEmailOtp: async (email: string, otp: string) => {
    try {
      const record = await prisma.pendingUserOtp.findUnique({ where: { email } });
      if (!record || record.otp !== otp || record.expiresAt < new Date()) {
        throw new Error('Invalid or expired OTP');
      }
      logger.info(`[UserService] OTP verified for ${email}`);
      return { verified: true };
    } catch (err: any) {
      logger.error('[UserService] verifyEmailOtp error:', err);
      throw err;
    }
  },

  // Step 3: Complete registration
  completeRegistration: async ({
    email,
    password,
    name,
    phone,
    altPhone,
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
          altPhone: altPhone || '',
          role,
          profileImage: defaultProfileImage,
        },
      });

      await prisma.pendingUserOtp.delete({ where: { email } });

      // Publish Kafka events
      try {
        await publishEvent({
          topic: KAFKA_TOPICS.USER.CREATED,
          messages: [{ value: JSON.stringify({ userId: user.id, email: user.email, role: user.role }) }],
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
                  altPhone: user.altPhone,
                  status: 'pending',
                }),
              },
            ],
          });
        }
      } catch (kafkaErr) {
        logger.warn('[Kafka] Failed to publish events:', kafkaErr);
      }

      return user;
    } catch (err: any) {
      logger.error('[UserService] completeRegistration error:', err);
      throw err;
    }
  },

  loginUser: async ({ email, password }: LoginUserParams) => {
    try {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user || !user.password) throw new Error('Invalid credentials');

      const isValid = await comparePassword(password, user.password);
      if (!isValid) throw new Error('Invalid credentials');

      return generateJWT({ userId: user.id, email: user.email, role: user.role });
    } catch (err: any) {
      logger.error('[UserService] loginUser error:', err);
      throw err;
    }
  },

  getUserProfile: async (userId: string) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, role: true, name: true, phone: true, altPhone: true, profileImage: true },
      });
      if (!user) throw new Error('User not found');
      return user;
    } catch (err: any) {
      logger.error('[UserService] getUserProfile error:', err);
      throw err;
    }
  },

  updateProfileImage: async (userId: string, imageUrl: string) => {
    try {
      return await prisma.user.update({ where: { id: userId }, data: { profileImage: imageUrl } });
    } catch (err: any) {
      logger.error('[UserService] updateProfileImage error:', err);
      throw err;
    }
  },

  updateUserRole: async (userId: string, newRole: UserRole) => {
    try {
      return await prisma.user.update({ where: { id: userId }, data: { role: newRole } });
    } catch (err: any) {
      logger.error('[UserService] updateUserRole error:', err);
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
        data: { email, name: name || '', profileImage: picture || '', role: UserRole.buyer, firebaseUid: uid },
      });
    } else if (!user.firebaseUid) {
      await prisma.user.update({ where: { id: user.id }, data: { firebaseUid: uid } });
    }
    return generateJWT({ userId: user.id, email: user.email, role: user.role });
  },

  uploadImageAndGetUrl: async (userId: string, file: Express.Multer.File) => {
    if (!userId || !file) throw new Error('User ID and file are required');
    const uploadedImageUrl = await uploadToCloudinary(file.buffer, 'user_profiles', `user_${userId}`);
    await prisma.user.update({ where: { id: userId }, data: { profileImage: uploadedImageUrl } });
    return uploadedImageUrl;
  },

  updateUserProfile: async (userId: string, updates: { name?: string; phone?: string; altPhone?: string }) => {
    return prisma.user.update({
      where: { id: userId },
      data: { ...updates },
      select: { id: true, name: true, phone: true, altPhone: true, email: true, role: true, profileImage: true },
    });
  },
};
