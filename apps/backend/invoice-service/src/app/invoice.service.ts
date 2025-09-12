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

interface SaveInvoiceParams {
  filePath: string;
  userId: string;
  orderId: string;
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
      buyer: { include: { addresses: true } },
      items: {
        include: {
          vendor: { include: { addresses: true } },
        },
      },
    },
  });

  if (!order) throw new Error(`❌ Order not found: ${orderId}`);

  // Use first vendor from items (for single-vendor orders)
  const vendor = order.items?.length ? order.items[0].vendor : null;
  return { ...order, vendor };
};

/** Save invoice PDF to MinIO */
export const saveInvoice = async ({ filePath, userId, orderId }: SaveInvoiceParams) => {
  const absolutePath = path.resolve(filePath);
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`❌ Invoice file does not exist at: ${absolutePath}`);
  }

  const objectName = `${MinioFolderPaths.INVOICE_PDFS}${userId}/${orderId}.pdf`;

  await ensureBucketExists(MinioBuckets.INVOICE);

  await uploadFile(MinioBuckets.INVOICE, objectName, absolutePath, {
    'Content-Type': MimeTypes.PDF,
  });

  console.log(`✅ Uploaded invoice "${orderId}" for user "${userId}" to MinIO`);
};

/** Retrieve invoice PDF as stream */
export const getInvoiceFile = async (userId: string, orderId: string): Promise<Readable> => {
  const objectName = `${MinioFolderPaths.INVOICE_PDFS}${userId}/${orderId}.pdf`;
  try {
    const stream = await minioClient.getObject(MinioBuckets.INVOICE, objectName);
    console.log(`📥 Retrieved invoice "${orderId}" for user "${userId}" from MinIO`);
    return stream;
  } catch {
    throw new Error(`Invoice not found for order ${orderId}`);
  }
};
