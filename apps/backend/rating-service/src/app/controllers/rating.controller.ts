import { Request, Response, NextFunction } from 'express';
import { ratingService } from '../services/rating.service';
import { sendSuccess } from '@shared/utils';
import { uploadToCloudinary } from '@shared/auth';
export const createRating = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user || !req.user.userId) 
      return res.status(401).json({ message: 'Unauthorized' });

    const { productId, vendorId, comment } = req.body;
    const score = parseFloat(req.body.score);

    if ((!productId && !vendorId) || (productId && vendorId) || isNaN(score)) {
      return res.status(400).json({
        message: 'Provide either productId or vendorId (not both), and a valid score.',
      });
    }

    let imageUrl: string | null = null;
    let videoUrl: string | null = null;

    if (req.files) {
      const imageFile = (req.files as any)['imageFile']?.[0];
      const videoFile = (req.files as any)['videoFile']?.[0];

      if (imageFile) {
        imageUrl = await uploadToCloudinary(
          imageFile.buffer,
          'ratings',
          undefined,
          imageFile.mimetype
        );
      }

      if (videoFile) {
        videoUrl = await uploadToCloudinary(
          videoFile.buffer,
          'ratings',
          undefined,
          videoFile.mimetype
        );
      }
    }

    const userId: string = req.user.userId;

    const created = await ratingService.createRating(userId, {
      productId: productId ?? null,
      vendorId: vendorId ?? null,
      score,
      comment: comment ?? null,
      imageUrl: imageUrl ?? null,
      videoUrl: videoUrl ?? null,
    });

    sendSuccess(res, 'Rating submitted', created);

  } catch (err: any) {
    if (err.code === 'P2002') {
      return res.status(400).json({
        message: 'You have already submitted a rating for this product or vendor.',
      });
    }

    if (err.code === 'NOT_PURCHASED') {
      return res.status(400).json({
        message: 'You cannot add a review because you did not purchase this product.',
      });
    }

    console.error('❌ Error in createRating:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};



export const getRatingsByProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { productId } = req.params;
    if (!productId) {
      return res.status(400).json({ message: 'Missing productId parameter' });
    }
    const ratings = await ratingService.getRatingsByProduct(productId);
    sendSuccess(res, 'Ratings fetched', ratings);
  } catch (err) {
    next(err);
  }
};

export const getRatingsBySeller = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { sellerId } = req.params;
    if (!sellerId) {
      return res.status(400).json({ message: 'Missing sellerId parameter' });
    }
    const ratings = await ratingService.getRatingsBySeller(sellerId);
    sendSuccess(res, 'Ratings fetched', ratings);
  } catch (err) {
    next(err);
  }
};


export const updateRating = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
 if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    // Here we *assert* that userId is string and exists
   const userId: string = req.user.userId;

    const ratingId = req.params.id;
    const { score, comment } = req.body;

    if (typeof score !== 'number') {
      return res.status(400).json({ message: 'Invalid score value' });
    }

    const updated = await ratingService.updateRating(
      userId,    // <-- use asserted string here
      ratingId,
      score,
      comment
    );

    sendSuccess(res, 'Rating updated', updated);
  } catch (err) {
    next(err);
  }
};


export const deleteRating = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
 if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const ratingId = req.params.id;
    const userId: string = req.user.userId;
await ratingService.deleteRating(userId, ratingId);
    sendSuccess(res, 'Rating deleted', null);
  } catch (err) {
    next(err);
  }
};
