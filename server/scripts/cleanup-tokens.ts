import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const result = await prisma.revokedToken.deleteMany({
    where: {
      expiresAt: { lt: new Date() },
    },
  });

  console.log(`Cleaned up ${result.count} expired revoked tokens`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
