import { Request, Response, NextFunction } from 'express';
import { PrismaClient, UserRole } from '@prisma/client';
import { userService } from '../services/user.service';
import { produceKafkaEvent } from '@shared/kafka';
import { sendSuccess } from '@shared/utils';
import { KAFKA_TOPICS } from '@shared/kafka';

const prisma = new PrismaClient();

// 📝 POST /api/users/register
export const initiateOtp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await userService.initiateRegistrationOtp(req.body.email);
    return sendSuccess(res, 'OTP sent', result);
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'Something went wrong' });
  }
};

export const verifyOtp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, otp } = req.body;
    const result = await userService.verifyEmailOtp(email, otp);
    return sendSuccess(res, 'OTP verified', result);
  } catch (err) {
    next(err);
  }
};

export const resendOtp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await userService.resendRegistrationOtp(req.body.email);
    return sendSuccess(res, 'OTP resent successfully', result);
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'Something went wrong' });
  }
};

// ✅ POST /api/users/complete-registration
export const completeOtpRegistration = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await userService.completeRegistration(req.body) as Awaited<ReturnType<typeof prisma.user.create>>;
    if (!user) throw new Error('User registration failed');

    // Kafka event: user created
    await produceKafkaEvent({
      topic: KAFKA_TOPICS.USER.CREATED,
      messages: [{ key: user.id, value: JSON.stringify(user) }],
    });

    // Kafka event: seller registered
    if (user.role === UserRole.seller) {
      await produceKafkaEvent({
        topic: KAFKA_TOPICS.USER.VENDOR_REGISTERED,
        messages: [
          {
            key: user.id,
            value: JSON.stringify({ userId: user.id, email: user.email, status: 'pending' }),
          },
        ],
      });
    }

    return sendSuccess(res, 'User registered successfully', user);
  } catch (err) {
    next(err);
  }
};

// 🔐 POST /api/users/login
export const loginUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = await userService.loginUser(req.body);
    return sendSuccess(res, 'Login successful', { token });
  } catch (err) {
    next(err);
  }
};

// 🙋‍♂️ GET /api/users/profile
export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized: userId missing' });

    const user = await userService.getUserProfile(userId);
    return sendSuccess(res, 'Profile fetched successfully', user);
  } catch (err) {
    next(err);
  }
};

// 🔁 PATCH /api/users/:id/role
export const updateRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const updated = await userService.updateUserRole(req.params.id, req.body.role);
    return sendSuccess(res, 'User role updated successfully', updated);
  } catch (err) {
    next(err);
  }
};

// 📸 PATCH /api/users/profile-image
export const updateProfileImage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized: userId missing' });

    const file = req.file;
    if (!file) return res.status(400).json({ error: 'No image file uploaded' });

    const updatedImageUrl = await userService.uploadImageAndGetUrl(userId, file);
    return sendSuccess(res, 'Profile image updated', { profileImage: updatedImageUrl });
  } catch (err) {
    console.error('[updateProfileImage error]', err);
    next(err);
  }
};

// ✏️ PATCH /api/users/profile
export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized: userId missing' });

    const { name, phone, altPhone } = req.body;
    const updated = await userService.updateUserProfile(userId, { name, phone, altPhone });

    return sendSuccess(res, 'Profile updated successfully', updated);
  } catch (err) {
    next(err);
  }
};

// 🔑 OAuth login
export const googleLogin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { provider, idToken } = req.body;
    if (!provider || !idToken) return res.status(400).json({ error: 'Provider and idToken are required' });

    const token = await userService.oauthLogin(provider, idToken);
    return sendSuccess(res, 'Google login successful', { token });
  } catch (err) {
    console.error('[googleLogin error]', err);
    next(err);
  }
};
