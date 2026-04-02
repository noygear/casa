import { PrismaClient } from '@prisma/client';

// Cloud databases (Neon, Supabase) require SSL. Append sslmode=require if the
// URL is a remote host and doesn't already specify an SSL mode.
if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('localhost')) {
  const url = new URL(process.env.DATABASE_URL);
  if (!url.searchParams.has('sslmode') && !url.searchParams.has('ssl')) {
    url.searchParams.set('sslmode', 'require');
    process.env.DATABASE_URL = url.toString();
  }
}

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'warn', 'error'] : ['warn', 'error'],
});

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export default prisma;
