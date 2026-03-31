import 'dotenv/config';
import { createApp } from './app.js';
import prisma from './prisma.js';
import { startScheduler, stopScheduler } from './scheduler.js';

const PORT = parseInt(process.env.PORT || '3001', 10);

const app = createApp();

const server = app.listen(PORT, () => {
  console.log(`Casa CRE API running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  startScheduler();
});

// Graceful shutdown
async function shutdown(signal: string) {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  stopScheduler();
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });

  // Force exit after 10s
  setTimeout(() => {
    console.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10_000);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
