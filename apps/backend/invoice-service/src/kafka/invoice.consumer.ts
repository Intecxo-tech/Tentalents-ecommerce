import { connectKafkaConsumer } from '@shared/middlewares/kafka/src/lib/kafka-consumer';
import { KafkaConsumerConfig } from '@shared/middlewares/kafka/src/lib/kafka-consumer';
import { EachMessagePayload } from 'kafkajs';
import { generateInvoiceAndUpload } from '../../../../../libs/shared/utils/src/lib/invoice-generator';
import { PrismaClient } from '@prisma/client';
import { MinioBuckets } from '@shared/minio';
import { logger } from '@shared/logger';

const prisma = new PrismaClient();

function getPublicUrl(filePath: string): string {
  // TODO: Replace this with your actual logic to generate a public URL for the MinIO file.
  // Example:
  // return `https://minio.example.com/${MinioBuckets.INVOICE}/${filePath}`;
  return `https://your-minio-domain/${MinioBuckets.INVOICE}/${filePath}`;
}

export async function startInvoiceConsumer(): Promise<void> {
  const config: KafkaConsumerConfig = {
    groupId: 'invoice-service-group',
    topics: ['invoice.generate'],
    handleMessage: async (topic: string, payload: EachMessagePayload) => {
      try {
        const message = payload.message.value?.toString();
        const { orderId } = JSON.parse(message || '{}');

        if (!orderId) {
          logger.warn(`[invoice.generate] ⚠️ Missing orderId`);
          return;
        }

        logger.info(`[invoice.generate] 📦 Generating invoice for orderId: ${orderId}`);

        // Find vendor(s) for the order - take first vendor for simplicity
       const orderItems = await prisma.orderItem.findMany({
  where: { orderId },
  select: {
    vendor: true, // Select the related vendor directly
  },
  take: 1,
});

if (orderItems.length === 0 || !orderItems[0].vendor) {
  logger.warn(`[invoice.generate] ⚠️ No vendor found for orderId: ${orderId}`);
  return;
}

const vendorId = orderItems[0].vendor.id; 

        // generateInvoiceAndUpload returns a string filePath only
        const filePath = await generateInvoiceAndUpload(orderId);

        if (!filePath) {
          logger.warn(`[invoice.generate] ⚠️ Missing filePath for orderId: ${orderId}`);
          return;
        }

        // Derive public URL for the PDF file
        const pdfUrl = getPublicUrl(filePath);

        await prisma.invoice.create({
          data: {
            orderId,
            vendorId,
            pdfUrl,
         
   
            issuedAt: new Date(),
          },
        });

        logger.info(`[invoice.generate] ✅ Invoice stored: ${filePath}`);
      } catch (err) {
        logger.error(`[invoice.generate] ❌ Failed to process message:`, err);
      }
    },
  };

  await connectKafkaConsumer(config);
}
