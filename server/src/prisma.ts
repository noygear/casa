import { PrismaClient } from '@prisma/client';

// Configure SSL based on the host:
//   .flycast  — Fly.io private network (WireGuard). SSL at PG level is not
//               available / uses self-signed certs. Disable TLS; WireGuard
//               already encrypts the connection.
//   localhost — no SSL needed.
//   everything else (Neon, Supabase, RDS…) — require SSL.
if (process.env.DATABASE_URL) {
  try {
    const url = new URL(process.env.DATABASE_URL);
    const host = url.hostname;
    if (!url.searchParams.has('sslmode') && !url.searchParams.has('ssl')) {
      if (host.endsWith('.flycast') || host.endsWith('.internal')) {
        url.searchParams.set('sslmode', 'disable');
      } else if (host !== 'localhost' && host !== '127.0.0.1') {
        url.searchParams.set('sslmode', 'require');
      }
      process.env.DATABASE_URL = url.toString();
    }
    console.log(`[prisma] connecting to ${host}:${url.port || 5432} (sslmode=${url.searchParams.get('sslmode') ?? 'default'})`);
  } catch (e) {
    console.error('[prisma] failed to parse DATABASE_URL:', e);
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
