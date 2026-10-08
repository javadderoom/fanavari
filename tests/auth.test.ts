import { describe, it, after } from 'node:test';
import assert from 'node:assert/strict';
import { NextRequest } from 'next/server';
import { prisma } from '../src/lib/prisma';
import { issueVerificationCode } from '../src/lib/otp';
import { POST as signup } from '../src/app/api/auth/signup/route';
import { POST as verifyContact } from '../src/app/api/auth/verify-contact/route';
import { POST as login } from '../src/app/api/auth/login/route';
import { POST as otpRequest } from '../src/app/api/auth/otp/request/route';
import { POST as loginOtp } from '../src/app/api/auth/login/otp/route';
import { GET as me } from '../src/app/api/auth/me/route';
import { POST as logout } from '../src/app/api/auth/logout/route';

const stamp = Date.now().toString(36);
const testEmail = `auth-e2e-${stamp}@example.com`;
const testPassword = 'TestPass123';
let createdUserId: string | null = null;

function req(path: string, body: unknown, cookie?: string): NextRequest {
  return new NextRequest(`http://localhost:3000${path}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...(cookie ? { cookie } : {}),
    },
    body: JSON.stringify(body),
  });
}

after(async () => {
  if (createdUserId) {
    await prisma.authAuditLog.deleteMany({ where: { userId: createdUserId } });
    await prisma.user.deleteMany({ where: { id: createdUserId } });
  }
  await prisma.$disconnect();
});

describe('Auth flow: signup -> verify -> login -> me -> logout', () => {
  it('signs up a pending user', async () => {
    const res = await signup(req('/api/auth/signup', {
      name: 'کاربر تست',
      contactType: 'email',
      contact: testEmail,
      password: testPassword,
    }));
    assert.equal(res.status, 201);
    const data = await res.json();
    assert.ok(data.pendingUserId);
    assert.equal(data.channel, 'email');
    createdUserId = data.pendingUserId;

    const row = await prisma.user.findUnique({ where: { id: createdUserId! } });
    assert.equal(row?.status, 'pending');
  });

  it('rejects login before verification with a resend hint', async () => {
    const res = await login(req('/api/auth/login', { identifier: testEmail, password: testPassword }));
    assert.equal(res.status, 403);
    const data = await res.json();
    assert.equal(data.needVerification, true);
  });

  it('rejects a wrong verification code', async () => {
    const res = await verifyContact(
      req('/api/auth/verify-contact', { identifier: testEmail, channel: 'email', code: '000000' })
    );
    assert.equal(res.status, 400);
  });

  it('verifies with a correct code, activates and logs in', async () => {
    // Clear the signup code (cooldown) and issue a fresh one like a resend would.
    await prisma.verificationCode.deleteMany({ where: { identifier: testEmail } });
    const { code } = await issueVerificationCode({ userId: createdUserId, channel: 'email', identifier: testEmail });

    const res = await verifyContact(req('/api/auth/verify-contact', { identifier: testEmail, channel: 'email', code }));
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.user.status, 'active');
    assert.equal(data.user.emailVerified, true);

    const cookie = res.headers.get('set-cookie');
    assert.ok(cookie && cookie.includes('fanavari_session'));
  });

  it('logs in with password after activation and resolves me', async () => {
    const loginRes = await login(req('/api/auth/login', { identifier: testEmail, password: testPassword }));
    assert.equal(loginRes.status, 200);
    const cookie = loginRes.headers.get('set-cookie')?.split(';')[0];
    assert.ok(cookie);

    const meRes = await me(new NextRequest('http://localhost:3000/api/auth/me', { headers: { cookie: cookie! } }));
    assert.equal(meRes.status, 200);
    const meData = await meRes.json();
    assert.equal(meData.user.email, testEmail);

    const logoutRes = await logout(
      new NextRequest('http://localhost:3000/api/auth/logout', { method: 'POST', headers: { cookie: cookie! } })
    );
    assert.equal(logoutRes.status, 200);

    const meAfter = await me(new NextRequest('http://localhost:3000/api/auth/me', { headers: { cookie: cookie! } }));
    assert.equal(meAfter.status, 401);
  });

  it('rejects a wrong password without revealing the cause', async () => {
    const res = await login(req('/api/auth/login', { identifier: testEmail, password: 'WrongPass999' }));
    assert.equal(res.status, 401);
    const data = await res.json();
    assert.match(data.error, /نادرست/);
  });
});

describe('Passwordless OTP login', () => {
  it('answers generically for unknown identifiers', async () => {
    const res = await otpRequest(req('/api/auth/otp/request', { identifier: 'ghost-9x99@example.com' }));
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.sent, true);
    assert.ok(!data.masked);

    const rows = await prisma.verificationCode.count({ where: { identifier: 'ghost-9x99@example.com' } });
    assert.equal(rows, 0);
  });

  it('issues a challenge and completes login for a verified contact', async () => {
    await prisma.verificationCode.deleteMany({ where: { identifier: testEmail } });
    const res = await otpRequest(req('/api/auth/otp/request', { identifier: testEmail }));
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.sent, true);
    assert.equal(data.channel, 'email');

    // Read the issued code hash path: use a fresh code via lib (cooldown cleared above).
    const { issueVerificationCode: issue } = await import('../src/lib/otp');
    await prisma.verificationCode.deleteMany({ where: { identifier: testEmail } });
    const { code } = await issue({ userId: createdUserId, channel: 'email', identifier: testEmail });

    const done = await loginOtp(req('/api/auth/login/otp', { identifier: testEmail, code }));
    assert.equal(done.status, 200);
    const doneData = await done.json();
    assert.equal(doneData.user.email, testEmail);
    assert.ok(done.headers.get('set-cookie')?.includes('fanavari_session'));
  });
});
