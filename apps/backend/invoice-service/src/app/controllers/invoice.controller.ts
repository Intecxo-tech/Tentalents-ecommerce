// apps/invoice-service/src/app/controllers/invoice.controller.ts
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { invoiceService } from '../services/invoice.service';
import nodemailer from 'nodemailer';
import { env } from '@shared/config';
import { AuthPayload, isAdmin } from '@shared/auth';
import { minioClient, MinioBuckets, MinioFolderPaths } from '@shared/minio';
import { Readable } from 'stream';
import axios from 'axios';

const prisma = new PrismaClient();
interface AuthRequest extends Request { user?: AuthPayload; }

/**
 * POST /api/invoices/generate/:orderId
 * Admin only – generates invoice, uploads to MinIO + Cloudinary, stores DB entry, emails buyer
 */
export async function generateInvoiceAutomatically(req: AuthRequest, res: Response) {
  const { orderId } = req.params;
  if (!isAdmin(req.user)) return res.status(403).json({ error: 'Admins only' });

  try {
    // Check if invoice already exists
    const existingInvoice = await prisma.invoice.findUnique({ where: { orderId } });
    if (existingInvoice) {
      return res.status(200).json({
        message: 'Invoice already generated',
        invoice: existingInvoice,
        cloudinaryUrl: existingInvoice.pdfUrl,
      });
    }

    // Generate invoice via service
    const { cloudinaryUrl, minioUrl, pdfBuffer } = await invoiceService.generateInvoice(orderId);

    // Fetch order to get buyer email
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { buyer: true },
    });
    if (!order?.buyer?.email) return res.status(400).json({ error: 'Buyer email missing' });

    // Send email to buyer (failures don't block response)
    try {
      const transporter = nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        secure: env.SMTP_PORT === 465,
        auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
      });
      await transporter.sendMail({
        from: env.EMAIL_FROM,
        to: order.buyer.email,
        subject: `Invoice for Order ${order.id}`,
        html: `<p>Dear ${order.buyer.name || 'Customer'},</p><p>Your invoice is attached.</p>`,
        attachments: [{ filename: `invoice-${order.id}.pdf`, content: pdfBuffer, contentType: 'application/pdf' }],
      });
    } catch (emailErr) {
      console.warn('Email sending failed:', emailErr);
    }

    return res.status(201).json({
      message: 'Invoice generated, uploaded, and emailed successfully',
      cloudinaryUrl,
      minioUrl,
    });
  } catch (err: any) {
    console.error('Error generating invoice:', err);
    return res.status(500).json({ error: 'Failed to generate invoice', details: err.message });
  }
}

/**
 * GET /api/invoices/download/:orderId
 * Buyer or Admin – streams PDF from MinIO using presigned URL; falls back to Cloudinary
 */
export async function downloadInvoice(req: AuthRequest, res: Response) {
  const { orderId } = req.params;
  const userId = req.user?.userId;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const invoice = await prisma.invoice.findUnique({ where: { orderId }, include: { order: true } });
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
    if (!isAdmin(req.user) && invoice.order?.buyerId !== userId) {
      return res.status(403).json({ error: 'Forbidden: You cannot download this invoice' });
    }

    const buyerId = invoice.order?.buyerId || userId;
    const objectName = `${MinioFolderPaths.INVOICE_PDFS}${buyerId}/${orderId}.pdf`;

    // Stream from MinIO
    try {
      const minioStream: Readable = await minioClient.getObject(MinioBuckets.INVOICE, objectName);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=invoice-${orderId}.pdf`);
      return minioStream.pipe(res);
    } catch (streamErr) {
      console.warn('Direct MinIO stream failed, trying presigned URL:', streamErr);
      try {
        const presignedUrl = await minioClient.presignedGetObject(MinioBuckets.INVOICE, objectName, 300);
        return res.redirect(presignedUrl);
      } catch (presignErr) {
        console.warn('Presigned URL failed, falling back to Cloudinary:', presignErr);
        if (!invoice.pdfUrl) return res.status(404).json({ error: 'Invoice file not found' });

        const cloudResp = await axios.get(invoice.pdfUrl, { responseType: 'arraybuffer' });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=invoice-${orderId}.pdf`);
        res.setHeader('Content-Length', cloudResp.data.byteLength);
        return res.send(Buffer.from(cloudResp.data));
      }
    }
  } catch (err: any) {
    console.error('Error downloading invoice:', err);
    return res.status(500).json({ error: 'Failed to download invoice', details: err.message });
  }
}
