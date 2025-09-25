import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type SearchParams = {
  query?: string;
  category?: string;
  brand?: string;
};

export const searchService = {
  search: async (params: SearchParams) => {
    const { query, category, brand } = params;

    const orConditions = [];
if (query) {
  orConditions.push(
    { title: { contains: query, mode: 'insensitive' as const } },
    { category: { contains: query, mode: 'insensitive' as const } },
    { brand: { contains: query, mode: 'insensitive' as const } }
  );
}

    if (category) {
      orConditions.push({
        category: category,
      });
    }

    if (brand) {
      orConditions.push({
        brand: brand,
      });
    }

    if (orConditions.length === 0) {
      return [];
    }

    return prisma.product.findMany({
      where: {
        OR: orConditions,
      },
      include: {
        listings: true,
        ratings: true,
      },
    });
  },
};
