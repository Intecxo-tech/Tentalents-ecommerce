import { PrismaClient, UserRole } from '@prisma/client';
import { hashPassword, comparePassword, generateJWT } from '@shared/auth';
import { produceKafkaEvent as publishEvent } from '@shared/kafka';
import { KAFKA_TOPICS } from '@shared/kafka';
import {admin} from '@shared/auth';
import { sendEmail } from '@shared/email';
import { logger } from '@shared/logger';
import { response } from 'express';
import * as crypto from 'crypto';
import { uploadToCloudinary } from '@shared/auth'; 
const prisma = new PrismaClient();

interface RegisterUserParams {
  email: string;
  password: string;
  phone: string;
  altphone: string;
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
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins

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
      // response.status(400).json({ error: err.message || 'Something went wrong' });
      logger.error('[UserService] initiateRegistrationOtp error:', err);
      throw err;
    }
  },
  // resen otp 
resendRegistrationOtp: async (email: string) => {
  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) throw new Error('User already exists');

    // Optionally, check if there's a recent OTP request to throttle resends (rate limiting)
    const recentOtp = await prisma.pendingUserOtp.findUnique({ where: { email } });
    if (recentOtp && recentOtp.expiresAt > new Date(Date.now() - 1 * 60 * 1000)) {
      // Prevent resend if OTP was sent less than 1 min ago (example)
      throw new Error('Please wait before requesting a new OTP');
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins

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

  // Step 2: Verify OTP
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

  // Step 3: Complete registration after OTP verified
  completeRegistration: async ({
    email,
    password,
    name,
    phone,
    altphone,
    role = UserRole.buyer,
  }: {
    email: string;
    password: string;
    name?: string;
    phone?: string;
    altphone?:string;
    role?: UserRole;
  }) => {
    try {
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) throw new Error('User already exists');

      const otpRecord = await prisma.pendingUserOtp.findUnique({ where: { email } });
      if (!otpRecord || otpRecord.expiresAt < new Date()) {
        throw new Error('OTP verification expired or not found');
      }
const defaultProfileImage = `https://gravatar.com/avatar/${crypto.createHash('md5').update(email).digest('hex')}?d=identicon`;
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

      const kafkaPayload = { userId: user.id, email: user.email, role: user.role };
    try {
  await publishEvent({
    topic: KAFKA_TOPICS.USER.CREATED,
    messages: [{ value: JSON.stringify(kafkaPayload) }],
  });
} catch (kafkaErr) {
  logger.warn('[Kafka] Failed to publish USER.CREATED event:', kafkaErr);
}

// Send EMAIL.USER_CREATED event
try {
  await publishEvent({
    topic: KAFKA_TOPICS.EMAIL.USER_CREATED,
    messages: [{ value: JSON.stringify({ email: user.email }) }],
  });
} catch (kafkaErr) {
  logger.warn('[Kafka] Failed to publish EMAIL.USER_CREATED event:', kafkaErr);
}

// Only for sellers
if (user.role === UserRole.seller) {
  try {
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
  } catch (kafkaErr) {
    logger.warn('[Kafka] Failed to publish USER.VENDOR_REGISTERED event:', kafkaErr);
  }
}
    } catch (err) {
      logger.error('[UserService] completeRegistration error:', err);
      throw err;
    }
  },


  loginUser: async ({ email, password }: LoginUserParams) => {
    try {
      logger.info('[UserService] 🔑 Login attempt for:', email);
      const user = await prisma.user.findUnique({ where: { email } });

      if (!user) {
        logger.warn('[UserService] ❌ Email not found');
        throw new Error('Invalid credentials');
      }

      if (!user.password) {
        logger.warn('[UserService] ❌ User has no password (OAuth account)');
        throw new Error('This account uses Google Login. Please sign in with Google.');
      }

      const isValid = await comparePassword(password, user.password);
      if (!isValid) {
        logger.warn('[UserService] ❌ Password mismatch');
        throw new Error('Invalid credentials');
      }

      logger.info('[UserService] ✅ Authenticated:', user.email);
      return generateJWT({ userId: user.id, email: user.email, role: user.role });
    } catch (err: any) {
      logger.error('[UserService] ❌ Login error:', err.message || err);
      throw err;
    }
  },

  getUserProfile: async (userId: string) => {
    try {
      if (!userId) throw new Error('User ID is required');

      logger.info('[UserService] 📄 Fetching profile for ID:', userId);

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, role: true, name: true, phone: true,profileImage: true, altPhone: true, 
 },
      });

      if (!user) throw new Error(`User with ID ${userId} not found`);

      return user;
    } catch (err: any) {
      logger.error('[UserService] ❌ getUserProfile error:', err.message || err);
      throw err;
    }
  },
 updateProfileImage: async (userId: string, imageUrl: string) => {
  try {
    if (!userId || !imageUrl) throw new Error('userId and imageUrl are required');

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { profileImage: imageUrl },
    });

    logger.info(`[UserService] 🔄 Updated profile image for user ${userId}`);
    return updatedUser;
  } catch (err: any) {
    logger.error('[UserService] ❌ updateProfileImage error:', err.message || err);
    throw err;
  }
},
  updateUserRole: async (userId: string, newRole: UserRole) => {
    try {
      if (!userId || !newRole) throw new Error('userId and newRole are required');

      logger.info(`[UserService] 🔄 Updating role for ${userId} to ${newRole}`);
      const updated = await prisma.user.update({
        where: { id: userId },
        data: { role: newRole },
      });

      return updated;
    } catch (err: any) {
      logger.error('[UserService] ❌ updateUserRole error:', err.message || err);
      throw err;
    }
  },

oauthLogin: async (provider: string, idToken: string) => {
  try {
    if (provider !== 'google') throw new Error('Unsupported provider');

    logger.info('[UserService] 🔐 Verifying Firebase ID token...');
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { email, name, picture, uid } = decodedToken;

    if (!email) throw new Error('Email not found in token');

    logger.info(`[UserService] ✅ Google token verified: ${email}`);

    // Try to find user by firebaseUid first
let user = await prisma.user.findFirst({ where: { firebaseUid: uid } });

    if (!user) {
      // If not found by firebaseUid, try finding by email
      user = await prisma.user.findUnique({ where: { email } });
    }

    if (!user) {
      // Create new user if doesn't exist
      user = await prisma.user.create({
        data: {
          email,
          name: name || '',
          profileImage: picture || '',
          role: UserRole.buyer, // default role
          firebaseUid: uid,
          // No password needed for OAuth users
        },
      });

      logger.info(`[UserService] 🆕 New Google user created: ${email}`);

      // Optionally publish Kafka events on user creation here
      // If new user, publish events
if (user && !user.firebaseUid) {
  try {
    await publishEvent({
      topic: KAFKA_TOPICS.USER.CREATED,
      messages: [{ value: JSON.stringify({ userId: user.id, email: user.email, role: user.role }) }],
    });
  } catch (kafkaErr) {
    logger.warn('[Kafka] Failed to publish USER.CREATED event (OAuth):', kafkaErr);
  }

  try {
    await publishEvent({
      topic: KAFKA_TOPICS.EMAIL.USER_CREATED,
      messages: [{ value: JSON.stringify({ email: user.email }) }],
    });
  } catch (kafkaErr) {
    logger.warn('[Kafka] Failed to publish EMAIL.USER_CREATED event (OAuth):', kafkaErr);
  }
}

    } else {
      logger.info(`[UserService] 🔑 Existing user logged in: ${email}`);

      // If user exists but firebaseUid is missing, update it to link accounts
      if (!user.firebaseUid) {
        await prisma.user.update({
          where: { id: user.id },
          data: { firebaseUid: uid },
        });
      }
    }

    // Return JWT token
    return generateJWT({ userId: user.id, email: user.email, role: user.role });
  } catch (err: any) {
    logger.error('[UserService] ❌ OAuth login error:', err.message || err);
    throw err;
  }
},

uploadImageAndGetUrl: async (userId: string, file: Express.Multer.File): Promise<string> => {
  try {
    if (!userId || !file) throw new Error('User ID and file are required');

    // Upload buffer to Cloudinary
    const uploadedImageUrl = await uploadToCloudinary(
      file.buffer,
      'user_profiles',
      `user_${userId}`
    );

    // Update user's profile image URL in DB
    await prisma.user.update({
      where: { id: userId },
      data: { profileImage: uploadedImageUrl },
    });

    logger.info(`[UserService] ✅ Uploaded and saved Cloudinary image for user ${userId}`);
    return uploadedImageUrl;
  } catch (err: any) {
    logger.error('[UserService] ❌ uploadImageAndGetUrl error:', err.message || err);
    throw err;
  }
},

  updateUserProfile: async (
    userId: string,
    updates: { name?: string; phone?: string; altPhone?: string }
  ) => {
    try {
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          ...(updates.name && { name: updates.name }),
          ...(updates.phone && { phone: updates.phone }),
          ...(updates.altPhone && { altPhone: updates.altPhone }),
        },
        select: {
          id: true,
          name: true,
          phone: true,
          altPhone:true,
          email: true,
          role: true,
          profileImage: true,
          
        },
      });

      logger.info(`[UserService] 🔄 Updated profile info for user ${userId}`);
      return updatedUser;
    } catch (err: any) {
      logger.error('[userService] updateUserProfile error:', err.message || err);
      throw err;
    }
  },


};



