// tools/scripts/get-order-ids.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const orderId = process.argv[2];

if (!orderId) {
  console.log('{}');
  process.exit(1);
}

async function main() {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        buyerId: true,
        items: { select: { vendorId: true }, take: 1 }
      }
    });

    if (!order) {
      console.log('{}');
      return;
    }

    const userId = order.buyerId;
    const vendorId = order.items[0]?.vendorId || null;

    console.log(JSON.stringify({ userId, vendorId }));
  } catch (err) {
    console.error(err);
    console.log('{}');
  } finally {
    await prisma.$disconnect();
  }
}

main();
