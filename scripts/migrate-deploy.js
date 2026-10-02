// Safe Prisma Migration Deployment Script for Vercel & CI/CD
const { execSync } = require('child_process');

const dbUrl = process.env.DATABASE_URL;

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
