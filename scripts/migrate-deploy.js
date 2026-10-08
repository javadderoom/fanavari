// Safe Prisma Migration Deployment Script for Vercel & CI/CD
// Uses DIRECT_URL (non-pooled) when available: `prisma migrate deploy`
// holds a pg_advisory_lock, which breaks on PgBouncer-style pooler
// endpoints (e.g. Neon's "-pooler" URL) with P1002 timeouts.
const { execSync } = require('child_process');

const dbUrl = process.env.DIRECT_URL || process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;

if (!dbUrl || dbUrl.includes('localhost') || dbUrl.includes('127.0.0.1')) {
  if (process.env.VERCEL) {
    console.warn('⚠️ Warning: DATABASE_URL is not configured or points to localhost in Vercel environment.');
    console.warn('ℹ️ To run database migrations on deploy, add your Neon DATABASE_URL in Vercel Settings -> Environment Variables.');
    process.exit(0);
  }
}

try {
  console.log('🚀 Running database migrations (prisma migrate deploy)...');
  execSync('npx prisma migrate deploy', { stdio: 'inherit' });
  console.log('✅ Database migrations applied successfully.');
} catch (error) {
  console.error('❌ Migration deployment failed:', error.message);
  process.exit(1);
}
