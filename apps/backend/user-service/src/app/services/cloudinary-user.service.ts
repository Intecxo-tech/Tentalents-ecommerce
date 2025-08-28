import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class CloudinaryUserService {
  static async getUserInvoices(userId: string) {
    return prisma.invoice.findMany({
      where: { order: { buyerId: userId } },
      include: { order: true },
    });
  }
}
