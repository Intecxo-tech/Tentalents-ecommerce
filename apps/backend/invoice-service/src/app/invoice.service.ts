import * as fs from 'fs';
import * as path from 'path';
import { Readable } from 'stream';
import { PrismaClient } from '@prisma/client';
import {
  uploadFile,
  minioClient,
  MinioBuckets,
  MinioFolderPaths,
  MimeTypes,
} from '@shared/minio';
import { generateInvoicePDFBuffer, InvoiceData, InvoiceItem } from '@shared/utils';

interface SaveInvoiceParams {
  orderId: string;
  userId: string;
}

const prisma = new PrismaClient();

/** Ensure MinIO bucket exists, create if missing */
const ensureBucketExists = async (bucket: string) => {
  const exists = await minioClient.bucketExists(bucket);
  if (!exists) {
    await minioClient.makeBucket(bucket);
    console.log(`✅ Created MinIO bucket: ${bucket}`);
  }
};

/** Fetch full order with buyer and vendor details */
export const getOrderDetails = async (orderId: string) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      buyer: true,
      items: {
        include: {
          product: true,
          vendor: true,
        },
      },
    },
  });

  if (!order) throw new Error(`❌ Order not found: ${orderId}`);

  const vendor = order.items?.length ? order.items[0].vendor : null;
  return { ...order, vendor };
};

/** Generate invoice PDF buffer for an order */
export const generateInvoicePDF = async (orderId: string): Promise<Buffer> => {
  const { buyer, items, vendor, id } = await getOrderDetails(orderId);

  if (!buyer) throw new Error('Buyer info missing');
  if (!vendor) throw new Error('Vendor info missing');

  const invoiceItems: InvoiceItem[] = items.map((i) => ({
    description: i.product?.title || 'Product',
    unitPrice: Number(i.unitPrice),
    quantity: i.quantity,
    taxRate: 0, // adjust if needed
  }));

  const invoiceData: InvoiceData = {
    orderId: id,
    customerName: buyer.name || 'Customer',
    customerEmail: buyer.email,
    billingAddress: buyer.address || 'Address not provided',
    shippingAddress: buyer.address || 'Address not provided',
    vendorName: vendor.name,
    vendorAddress: vendor.address || 'Address not provided',
    gstNumber: vendor.gstNumber || '',
    panNumber: vendor.panNumber || '',
    items: invoiceItems,
    date: new Date().toISOString().split('T')[0],
  };

  return generateInvoicePDFBuffer(invoiceData);
};

/** Save invoice PDF to MinIO */
// saveInvoiceToMinIO
export const saveInvoiceToMinIO = async (buffer: Buffer, { userId, orderId }: SaveInvoiceParams) => {
  const objectName = `${MinioFolderPaths.INVOICE_PDFS}${userId}/${orderId}.pdf`;

  await ensureBucketExists(MinioBuckets.INVOICE);

  // Pass buffer directly to MinIO client
 await minioClient.putObject(
  MinioBuckets.INVOICE,
  objectName,
  buffer,
  buffer.length, // <-- size
  { 'Content-Type': MimeTypes.PDF } // optional metadata
);


  console.log(`✅ Uploaded invoice "${orderId}" for user "${userId}" to MinIO`);
};

/** Retrieve invoice PDF as stream */
export const getInvoiceFile = async (userId: string, orderId: string): Promise<Readable> => {
  const objectName = `${MinioFolderPaths.INVOICE_PDFS}${userId}/${orderId}.pdf`;
  try {
    const stream = await minioClient.getObject(MinioBuckets.INVOICE, objectName);
    console.log(`📥 Retrieved invoice "${orderId}" for user "${userId}" from MinIO`);
    return stream;
  } catch (err) {
    throw new Error(`Invoice not found for order ${orderId}: ${err}`);
  }
};
