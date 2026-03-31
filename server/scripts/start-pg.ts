import EmbeddedPostgres from 'embedded-postgres';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = 5433;
const DB_NAME = 'casa_cre';

async function main() {
  console.log('Starting embedded PostgreSQL...');

  const pg = new EmbeddedPostgres({
    databaseDir: resolve(__dirname, '../../.pg-data'),
    user: 'postgres',
    password: 'password',
    port: PORT,
    persistent: true,
  });

  try {
    await pg.initialise();
  } catch {
    // Data directory already exists, skip init
  }
  await pg.start();
  console.log(`PostgreSQL running on port ${PORT}`);

  try {
    await pg.createDatabase(DB_NAME);
    console.log(`Database '${DB_NAME}' created`);
  } catch {
    console.log(`Database '${DB_NAME}' already exists`);
  }

  console.log(`\nConnection URL: postgresql://postgres:password@localhost:${PORT}/${DB_NAME}?schema=public`);
  console.log('Press Ctrl+C to stop PostgreSQL\n');

  // Keep alive
  process.on('SIGINT', async () => {
    console.log('\nStopping PostgreSQL...');
    await pg.stop();
    process.exit(0);
  });

  // Keep process alive
  await new Promise(() => {});
}

main().catch((err) => {
  console.error('Failed:', err);
  process.exit(1);
});
