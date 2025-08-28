import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class CloudinaryVendorService {
  static async getVendorInvoices(vendorId: string) {
    return prisma.invoice.findMany({ where: { vendorId } });
  }
}
