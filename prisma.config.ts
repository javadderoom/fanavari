import { defineConfig } from '@prisma/config';
import 'dotenv/config';

export default defineConfig({
  schema: './prisma/schema.prisma',
  datasource: {
    // Migrations need a stable session for the advisory lock, so they must
    // run on a DIRECT (non-pooled) connection. PgBouncer-style pooler URLs
    // (e.g. Neon's "-pooler" endpoint) break pg_advisory_lock and fail with
    // P1002 timeouts. The app runtime keeps using DATABASE_URL (pooled).
    // Vercel's Neon integration exposes the direct URL as DATABASE_URL_UNPOOLED.
    url:
      process.env.DIRECT_URL ||
      process.env.DATABASE_URL_UNPOOLED ||
      process.env.DATABASE_URL ||
      'postgresql://fanavari:fanavaripassword@localhost:5433/fanavari?schema=public',
  },
});
