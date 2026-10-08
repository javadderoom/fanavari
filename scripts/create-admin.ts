/**
 * Break-glass admin provisioning for production.
 *
 * The app has no default admin (by design — the seed's dev accounts are for
 * local use only). Normal flow: the person signs up in prod, then you run
 * this script to promote them. It can also create the account outright.
 *
 * Usage (run from your machine — never commit credentials):
 *   1. Promote an existing signup to Super Admin:
 *      DATABASE_URL="<prod-unpooled-url>" npx tsx scripts/create-admin.ts --promote --email="boss@org.ir"
 *   2. Create a Super Admin directly (active, contact pre-verified):
 *      DATABASE_URL="<prod-unpooled-url>" npx tsx scripts/create-admin.ts --email="boss@org.ir" --password="..." --name="..."
 *      DATABASE_URL="<prod-unpooled-url>" npx tsx scripts/create-admin.ts --phone="0912..." --password="..." --name="..."
 *
 * The connection goes in DATABASE_URL (this script uses the runtime client,
 * which reads that variable; an inline value overrides your local .env).
 * Paste your Vercel/Neon *unpooled/direct* URL there — either pooled or
 * direct works for a one-off script. Get it from: Vercel Dashboard ->
 * Storage -> Postgres -> .env.local tab (DATABASE_URL_UNPOOLED value),
 * or your Neon project dashboard.
 */
import 'dotenv/config';
import { prisma } from '../src/lib/prisma';
import { ROLE_PRESETS } from '../src/lib/permissions';
import { hashPassword, isValidPassword } from '../src/lib/password';
import { normalizePhone, normalizeEmail } from '../src/lib/otp';

function arg(name: string): string | null {
  const argv = process.argv;
  for (let i = 0; i < argv.length; i++) {
    const token = argv[i];
    // --name=value (quotes already stripped or kept literally by the shell)
    if (token.startsWith(`--${name}=`)) {
      return token.slice(name.length + 3).replace(/^["']|["']$/g, '');
    }
    // --name value
    if (token === `--${name}` && i + 1 < argv.length) {
      return argv[i + 1];
    }
  }
  return null;
}

async function main() {
  const promote = process.argv.includes('--promote');
  const email = normalizeEmail(arg('email'));
  const phone = normalizePhone(arg('phone'));
  const name = (arg('name') || '').trim();
  const password = arg('password') || '';

  if (!email && !phone) {
    console.error('Provide --email or --phone to identify the account.');
    process.exit(1);
  }

  const existing = await prisma.user.findFirst({
    where: email ? { email } : { phone },
  });

  if (promote) {
    if (!existing) {
      console.error('No account found for promotion. The person must sign up first (or omit --promote to create).');
      process.exit(1);
    }
    const updated = await prisma.user.update({
      where: { id: existing.id },
      data: {
        roleName: ROLE_PRESETS.SUPER_ADMIN.name,
        permissions: ROLE_PRESETS.SUPER_ADMIN.bitfield,
        status: 'active',
        emailVerifiedAt: existing.email ? existing.emailVerifiedAt || new Date() : null,
        phoneVerifiedAt: existing.phone ? existing.phoneVerifiedAt || new Date() : null,
      },
      select: { id: true, name: true, email: true, phone: true, roleName: true, status: true },
    });
    console.log('Promoted to Super Admin:', updated);
    return;
  }

  if (existing) {
    console.error('Account already exists. Use --promote to upgrade it instead.');
    process.exit(1);
  }
  if (name.length < 2) {
    console.error('Provide --name (min 2 characters) when creating.');
    process.exit(1);
  }
  if (!isValidPassword(password)) {
    console.error('Provide --password (min 8 characters) when creating.');
    process.exit(1);
  }

  const created = await prisma.user.create({
    data: {
      name,
      email,
      phone,
      passwordHash: await hashPassword(password),
      emailVerifiedAt: email ? new Date() : null,
      phoneVerifiedAt: phone ? new Date() : null,
      roleName: ROLE_PRESETS.SUPER_ADMIN.name,
      permissions: ROLE_PRESETS.SUPER_ADMIN.bitfield,
      status: 'active',
    },
    select: { id: true, name: true, email: true, phone: true, roleName: true, status: true },
  });
  console.log('Super Admin created:', created);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
