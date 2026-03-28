import EmbeddedPostgres from 'embedded-postgres';
import { execSync } from 'child_process';
import { writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = 5433;
const DB_NAME = 'casa_cre';
const DATABASE_URL = `postgresql://postgres:password@localhost:${PORT}/${DB_NAME}?schema=public`;

async function main() {
  console.log('Starting embedded PostgreSQL...');

  const pg = new EmbeddedPostgres({
    databaseDir: resolve(__dirname, '../../.pg-data'),
    user: 'postgres',
    password: 'password',
    port: PORT,
    persistent: true,
  });

  await pg.initialise();
  await pg.start();
  console.log(`PostgreSQL running on port ${PORT}`);

  // Create database if it doesn't exist
  try {
    await pg.createDatabase(DB_NAME);
    console.log(`Database '${DB_NAME}' created`);
  } catch {
    console.log(`Database '${DB_NAME}' already exists`);
  }

  // Write .env file
  const envPath = resolve(__dirname, '../.env');
  const envContent = `DATABASE_URL="${DATABASE_URL}"
JWT_SECRET="dev-secret-change-in-production"
FRONTEND_URL="http://localhost:5173"
NODE_ENV="development"
PORT=3001
`;
  writeFileSync(envPath, envContent);
  console.log('.env file written');

  // Run migrations
  console.log('Running Prisma migrations...');
  execSync(`npx prisma migrate dev --name init --schema=../prisma/schema.prisma`, {
    cwd: resolve(__dirname, '..'),
    env: { ...process.env, DATABASE_URL },
    stdio: 'inherit',
  });

  // Seed
  console.log('Seeding database...');
  execSync(`npx tsx prisma/seed.ts`, {
    cwd: resolve(__dirname, '..'),
    env: { ...process.env, DATABASE_URL },
    stdio: 'inherit',
  });

  // Start server
  console.log('\nStarting API server...');
  execSync(`npx tsx src/index.ts`, {
    cwd: resolve(__dirname, '..'),
    env: { ...process.env, DATABASE_URL },
    stdio: 'inherit',
  });
}

main().catch((err) => {
  console.error('Failed to start:', err);
  process.exit(1);
});
