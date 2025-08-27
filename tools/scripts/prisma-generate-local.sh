cp prisma/schema.prisma prisma/schema.local.prisma
sed -i '/binaryTargets/d' prisma/schema.local.prisma
sed -i '/generator client {/a \
  binaryTargets = ["native","debian-openssl-3.0.x"]' prisma/schema.local.prisma
npx prisma generate --schema=prisma/schema.local.prisma
rm prisma/schema.local.prisma
