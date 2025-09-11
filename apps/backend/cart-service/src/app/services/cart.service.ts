import { setCache, getCache, deleteCache } from '@shared/redis';
import { connectKafkaProducer, KAFKA_TOPICS } from '@shared/kafka';
import type { Producer } from 'kafkajs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const CART_TTL = 60 * 60 * 2; // 2 hours cache

let kafkaProducer: Producer | null = null;

const includeCartRelations = {
  vendor: { select: { id: true, name: true } },
  product: {
    select: {
      id: true,
      title: true,
      description: true,
      imageUrls: true,
      category: true,
      brand: true,
    },
  },
  productListing: {
    select: {
      id: true,
      price: true,
      stock: true,
      sku: true,
      status: true,
      dispatchTimeInDays: true,
      shippingCost: true,
    },
  },
};

async function getKafkaProducer(): Promise<Producer> {
  if (!kafkaProducer) kafkaProducer = await connectKafkaProducer();
  return kafkaProducer;
}

async function refreshCartCache(userId: string) {
  const cart = await prisma.cartItem.findMany({
    where: { userId } as any,
    include: includeCartRelations,
  });

  const cacheKey = `cart:${userId}`;
  if (cart.length === 0) await deleteCache(cacheKey);
  else await setCache(cacheKey, cart, CART_TTL);

  return cart;
}

export const cartService = {
  getCart: async (userId: string) => {
    const cacheKey = `cart:${userId}`;
    try {
      const cachedCart = await getCache<typeof includeCartRelations[]>(cacheKey);
      if (cachedCart && Array.isArray(cachedCart)) return cachedCart;

      const cart = await prisma.cartItem.findMany({
        where: { userId, savedForLater: false } as any,
        include: includeCartRelations,
      });

      if (cart.length === 0) await deleteCache(cacheKey);
      else await setCache(cacheKey, cart, CART_TTL);

      return cart;
    } catch (error) {
      console.error('Error fetching cart:', error);
      throw error;
    }
  },

  addToCart: async (
    userId: string,
    item: { listingId: string; productId: string; quantity: number }
  ) => {
    try {
      const listing = await prisma.productListing.findUnique({
        where: { id: item.listingId },
        select: { vendorId: true },
      });
      if (!listing) throw new Error('Invalid listingId');

      const existingItem = await prisma.cartItem.findFirst({
        where: { userId, listingId: item.listingId, savedForLater: false } as any,
      });

      if (existingItem) {
        await prisma.cartItem.update({
          where: { id: existingItem.id },
          data: { quantity: existingItem.quantity + item.quantity },
        });
      } else {
        await prisma.cartItem.create({
          data: {
            userId,
            listingId: item.listingId,
            productId: item.productId,
            vendorId: listing.vendorId,
            quantity: item.quantity,
            savedForLater: false,
          } as any,
        });
      }

      const updatedCart = await refreshCartCache(userId);

      try {
        const producer = await getKafkaProducer();
        await producer.send({
          topic: KAFKA_TOPICS.CART.UPDATED,
          messages: [{ value: JSON.stringify({ userId, cart: updatedCart }) }],
        });
      } catch (kafkaErr) {
        console.error('Failed to send CART_UPDATED Kafka message:', kafkaErr);
      }

      return updatedCart;
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  },

  updateCartItemQuantity: async (userId: string, listingId: string, quantityChange: number) => {
    try {
      const existingItem = await prisma.cartItem.findFirst({
        where: { userId, listingId } as any,
      });
      if (!existingItem) throw new Error('Cart item not found');

      const newQuantity = existingItem.quantity + quantityChange;
      if (newQuantity <= 0) {
        await prisma.cartItem.delete({ where: { id: existingItem.id } });
      } else {
        await prisma.cartItem.update({
          where: { id: existingItem.id },
          data: { quantity: newQuantity },
        });
      }

      const updatedCart = await refreshCartCache(userId);

      try {
        const producer = await getKafkaProducer();
        await producer.send({
          topic: KAFKA_TOPICS.CART.UPDATED,
          messages: [{ value: JSON.stringify({ userId, cart: updatedCart }) }],
        });
      } catch (kafkaErr) {
        console.error('Failed to send CART_UPDATED Kafka message:', kafkaErr);
      }

      return updatedCart;
    } catch (error) {
      console.error('Error updating cart item quantity:', error);
      throw error;
    }
  },

  deleteCartItem: async (userId: string, itemId: string) => {
    try {
      await prisma.cartItem.deleteMany({ where: { id: itemId, userId } as any });
      const updatedCart = await refreshCartCache(userId);

      try {
        const producer = await getKafkaProducer();
        await producer.send({
          topic: KAFKA_TOPICS.CART.UPDATED,
          messages: [{ value: JSON.stringify({ userId, cart: updatedCart }) }],
        });
      } catch (kafkaErr) {
        console.error('Failed to send CART_UPDATED Kafka message:', kafkaErr);
      }

      return updatedCart;
    } catch (error) {
      console.error('Error deleting cart item:', error);
      throw error;
    }
  },

  getWishlist: async (userId: string) => {
    try {
      return prisma.cartItem.findMany({
        where: { userId, savedForLater: true } as any,
        include: includeCartRelations,
      });
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      throw error;
    }
  },

  toggleSaveForLater: async (userId: string, itemId: string, saveForLater: boolean) => {
    try {
      await prisma.cartItem.updateMany({
        where: { id: itemId, userId } as any,
        data: { savedForLater: saveForLater } as any,
      });

      return refreshCartCache(userId);
    } catch (error) {
      console.error('Error toggling save for later:', error);
      throw error;
    }
  },

  checkout: async (userId: string) => {
    try {
      const cart = await prisma.cartItem.findMany({
        where: { userId, savedForLater: false } as any,
        include: includeCartRelations,
      });

      try {
        const producer = await getKafkaProducer();
        await producer.send({
          topic: KAFKA_TOPICS.CART.CHECKED_OUT,
          messages: [{ value: JSON.stringify({ userId, cart }) }],
        });
      } catch (kafkaErr) {
        console.error('Failed to send CART_CHECKED_OUT Kafka message:', kafkaErr);
      }

      await prisma.cartItem.deleteMany({ where: { userId, savedForLater: false } as any });
      await deleteCache(`cart:${userId}`);

      return { status: 'checked_out', cart };
    } catch (error) {
      console.error('Error during checkout:', error);
      throw error;
    }
  },
};
