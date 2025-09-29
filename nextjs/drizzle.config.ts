import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

config({ path: '.env' });

const POSTGRES_URL = process.env.POSTGRES_URL!;

if (!POSTGRES_URL) {
  throw new Error('POSTGRES_URL is not set');
}

console.log('POSTGRES_URL', POSTGRES_URL);

export default defineConfig({
  schema: './server/db/schema.ts',
  out: './migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.POSTGRES_URL!,
  },
});
