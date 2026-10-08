// Safe Prisma Migration Deployment Script for Vercel & CI/CD
// Uses DIRECT_URL (non-pooled) when available: `prisma migrate deploy`
// holds a pg_advisory_lock, which breaks on PgBouncer-style pooler
// endpoints (e.g. Neon's "-pooler" URL) with P1002 timeouts.
// Retries with backoff: a cold/suspended Neon compute or a lock left
// behind by an overlapping deploy can exceed Prisma's 10s advisory-lock
// timeout on the first attempt but succeed once the DB is warm.
const { execSync } = require('child_process');

const dbUrl = process.env.DIRECT_URL || process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;

if (!dbUrl || dbUrl.includes('localhost') || dbUrl.includes('127.0.0.1')) {
  if (process.env.VERCEL) {
    console.warn('⚠️ Warning: DATABASE_URL is not configured or points to localhost in Vercel environment.');
    console.warn('ℹ️ To run database migrations on deploy, add your Neon DATABASE_URL in Vercel Settings -> Environment Variables.');
    process.exit(0);
  }
}

// Log only the host (never credentials) so build logs show which
// endpoint migrations actually ran against.
let dbHost = '(unknown)';
let isPooled = false;
try {
  const parsed = new URL(dbUrl);
  dbHost = parsed.hostname;
  isPooled = dbHost.includes('pooler');
} catch (e) {
  // keep placeholder
}

const MAX_ATTEMPTS = 3;
const RETRY_WAIT_MS = 20000;

function sleep(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
  try {
    console.log(`🚀 Running database migrations (attempt ${attempt}/${MAX_ATTEMPTS}, host: ${dbHost}, pooled: ${isPooled})...`);
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });
    console.log('✅ Database migrations applied successfully.');
    process.exit(0);
  } catch (error) {
    console.error(`⚠️ Migration attempt ${attempt} failed: ${error.message}`);
    if (attempt < MAX_ATTEMPTS) {
      console.log(`⏳ Waiting ${RETRY_WAIT_MS / 1000}s before retry (lets Neon wake up / stale lock clear)...`);
      sleep(RETRY_WAIT_MS);
    }
  }
}

console.error('❌ Migration deployment failed after all attempts.');
process.exit(1);
