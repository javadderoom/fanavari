import { describe, it, after, before } from 'node:test';
import assert from 'node:assert/strict';
import { NextRequest } from 'next/server';
import { prisma } from '../src/lib/prisma';
import { createSession, SESSION_COOKIE } from '../src/lib/session';
import { GET as getBookmarks, POST as saveBookmark, DELETE as deleteBookmark } from '../src/app/api/bookmarks/route';

const stamp = Date.now().toString(36);
const testEmail = `bookmark-test-${stamp}@example.com`;
let testUser: { id: string } | null = null;
let sessionCookie = '';
let testProcessId = '';

before(async () => {
  // Create a verified active test user
  testUser = await prisma.user.create({
    data: {
      name: 'کاربر تست نشان‌شده‌ها',
      email: testEmail,
      emailVerifiedAt: new Date(),
      status: 'active',
      passwordHash: 'dummy-hash',
    },
  });

  const rawSessionToken = await createSession(testUser.id);
  sessionCookie = `${SESSION_COOKIE}=${rawSessionToken}`;

  // Find or create a test process
  const existingProcess = await prisma.process.findFirst({ select: { id: true } });
  if (existingProcess) {
    testProcessId = existingProcess.id;
  } else {
    const proc = await prisma.process.create({
      data: {
        title: 'فرایند تست بوکمارک',
        slug: `bookmark-test-proc-${stamp}`,
        scope: 'software',
        category: 'it',
        description: 'توضیحات تست',
      },
    });
    testProcessId = proc.id;
  }
});

after(async () => {
  if (testUser) {
    await prisma.userBookmark.deleteMany({ where: { userId: testUser.id } });
    await prisma.userSession.deleteMany({ where: { userId: testUser.id } });
    await prisma.user.deleteMany({ where: { id: testUser.id } });
  }
  await prisma.$disconnect();
});

describe('User Bookmarks & Favorites API', () => {
  describe('Guest / Unauthenticated Access', () => {
    it('GET /api/bookmarks returns empty array for guests', async () => {
      const req = new NextRequest('http://localhost:3000/api/bookmarks', {
        method: 'GET',
      });
      const res = await getBookmarks(req);
      assert.equal(res.status, 200);
      const data = await res.json();
      assert.deepEqual(data.processIds, []);
    });

    it('POST /api/bookmarks returns 401 for unauthenticated request', async () => {
      const req = new NextRequest('http://localhost:3000/api/bookmarks', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ processId: testProcessId }),
      });
      const res = await saveBookmark(req);
      assert.equal(res.status, 401);
    });

    it('DELETE /api/bookmarks returns 401 for unauthenticated request', async () => {
      const req = new NextRequest('http://localhost:3000/api/bookmarks', {
        method: 'DELETE',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ processId: testProcessId }),
      });
      const res = await deleteBookmark(req);
      assert.equal(res.status, 401);
    });
  });

  describe('Authenticated User Bookmarking', () => {
    it('POST /api/bookmarks adds a new bookmark for the authenticated user', async () => {
      const req = new NextRequest('http://localhost:3000/api/bookmarks', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          cookie: sessionCookie,
        },
        body: JSON.stringify({ processId: testProcessId }),
      });
      const res = await saveBookmark(req);
      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.success, true);
      assert.equal(data.processId, testProcessId);
    });

    it('GET /api/bookmarks returns the bookmarked process ID', async () => {
      const req = new NextRequest('http://localhost:3000/api/bookmarks', {
        method: 'GET',
        headers: { cookie: sessionCookie },
      });
      const res = await getBookmarks(req);
      assert.equal(res.status, 200);
      const data = await res.json();
      assert.ok(Array.isArray(data.processIds));
      assert.ok(data.processIds.includes(testProcessId));
    });

    it('POST /api/bookmarks batch syncs array of process IDs', async () => {
      const req = new NextRequest('http://localhost:3000/api/bookmarks', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          cookie: sessionCookie,
        },
        body: JSON.stringify({ processIds: [testProcessId] }),
      });
      const res = await saveBookmark(req);
      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.success, true);
      assert.equal(data.count, 1);
    });

    it('DELETE /api/bookmarks removes the bookmark', async () => {
      const req = new NextRequest('http://localhost:3000/api/bookmarks', {
        method: 'DELETE',
        headers: {
          'content-type': 'application/json',
          cookie: sessionCookie,
        },
        body: JSON.stringify({ processId: testProcessId }),
      });
      const res = await deleteBookmark(req);
      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.success, true);
      assert.equal(data.removed, true);

      // Verify it is gone
      const verifyReq = new NextRequest('http://localhost:3000/api/bookmarks', {
        method: 'GET',
        headers: { cookie: sessionCookie },
      });
      const verifyRes = await getBookmarks(verifyReq);
      const verifyData = await verifyRes.json();
      assert.ok(!verifyData.processIds.includes(testProcessId));
    });
  });
});
