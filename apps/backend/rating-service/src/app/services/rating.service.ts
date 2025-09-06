import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

interface CreateRatingInput {
  productId?: string | null;  // allow null explicitly
  vendorId?: string | null; 
  score: number;
  imageUrl?: string | null;
  videoUrl?: string | null;
  comment?: string | null;
}

export const ratingService = {
createRating: async (userId: string, data: CreateRatingInput) => {
   if (!data.productId) {
    throw new Error('Product ID is required to submit a review.');
  }

  // ✅ 1. Check if user has purchased this product
  const hasPurchased = await prisma.orderItem.findFirst({
    where: {
      productId: data.productId,
      order: {
        buyerId: userId,
        status: 'delivered', // Make sure your order has a completed/delivered status
      },
    },
  });

  if (!hasPurchased) {
    throw new Error('You can only review products you have purchased.');
  }
  let vendorId = data.vendorId ?? null;

  if (!vendorId && data.productId) {
    const productListing = await prisma.productListing.findFirst({
      where: { productId: data.productId },
      select: { vendorId: true },
    });
    vendorId = productListing?.vendorId ?? null;
  }

  return prisma.rating.create({
    data: {
      userId,
      productId: data.productId ?? null,
      vendorId,
      score: data.score,
      comment: data.comment ?? null,
      imageUrl: data.imageUrl ?? null,
      videoUrl: data.videoUrl ?? null,
    },
  });
},

  getRatingsByProduct: async (productId: string) => {
    return prisma.rating.findMany({
      where: { productId },
      include: { user: true },
    });
  },

  getRatingsBySeller: async (vendorId: string) => {
    return prisma.rating.findMany({
      where: { vendorId },
      include: { user: true },
    });
  },

  updateRating: async (
    userId: string,
    ratingId: string,
    score: number,
    comment?: string
  ) => {
    const updateData: { score: number; comment?: string } = { score };
    if (comment !== undefined) {
      updateData.comment = comment;
    }

    return prisma.rating.updateMany({
      where: { id: ratingId, userId },
      data: updateData,
    });
  },

  deleteRating: async (userId: string, ratingId: string) => {
    return prisma.rating.deleteMany({
      where: { id: ratingId, userId },
    });
  },
};
