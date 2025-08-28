import { Request, Response } from 'express';
import { CloudinaryInvoiceService } from '../services/cloudinary-invoice.service';
import { logger } from '@shared/logger';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class CloudinaryInvoiceController {
  static async generateInvoice(req: Request, res: Response) {
    try {
      const { orderId, userId, userName, userEmail } = req.body; // now also get userName and userEmail

      if (!orderId || !userId || !userName || !userEmail) {
        return res.status(400).json({
          success: false,
          message: 'orderId, userId, userName, and userEmail are required',
        });
      }

      // Fetch order with items and vendor info
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          items: { include: { vendor: true } },
        },
      });

      if (!order) {
        return res.status(404).json({
          success: false,
          message: `Order ${orderId} not found`,
        });
      }

      const vendor = order.items[0].vendor; // assuming single vendor per order

      const invoiceData = {
        orderId: order.id,
        vendorId: vendor.id,
        userId,
        userName,
        userEmail,
        vendorName: vendor.name,
        vendorEmail: vendor.email,
        items: order.items.map(item => ({
          title: item.listingId, // replace with product title if available
          quantity: item.quantity,
          unitPrice: Number(item.unitPrice),
          totalPrice: Number(item.totalPrice),
        })),
        totalAmount: order.items.reduce(
          (sum, item) => sum + Number(item.totalPrice),
          0
        ),
      };

      const { vendorInvoiceUrl, userInvoiceUrl } =
        await CloudinaryInvoiceService.generateVendorAndUserInvoices(invoiceData);

      logger.info('[cloudinary-invoice-controller] ✅ Vendor and User invoices generated');

      return res.status(201).json({
        success: true,
        vendorInvoiceUrl,
        userInvoiceUrl,
      });
    } catch (error) {
      logger.error('[cloudinary-invoice-controller] ❌ Failed to generate invoice:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to generate invoice',
        error: error instanceof Error ? error.message : error,
      });
    }
  }
}
