import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { NextRequest } from 'next/server';
import { POST as createDepartment } from '../src/app/api/departments/route';
import { Permissions } from '../src/lib/permissions';

describe('API Routes Permissions & Validation', () => {
  describe('POST /api/departments', () => {
    it('should reject requests with 403 Forbidden when permissions header is missing', async () => {
      const req = new NextRequest('http://localhost:3000/api/departments', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({ name: 'وزارت بازرگانی' }),
      });

      const res = await createDepartment(req);
      assert.equal(res.status, 403);
      const data = await res.json();
      assert.ok(data.error.includes('Forbidden'));
    });

    it('should reject requests with 403 Forbidden when user only has VIEW_PROCESSES', async () => {
      const req = new NextRequest('http://localhost:3000/api/departments', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-user-permissions': String(Permissions.VIEW_PROCESSES),
        },
        body: JSON.stringify({ name: 'وزارت بازرگانی' }),
      });

      const res = await createDepartment(req);
      assert.equal(res.status, 403);
    });

    it('should return 400 Bad Request when authorized user submits empty name', async () => {
      const req = new NextRequest('http://localhost:3000/api/departments', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-user-permissions': String(Permissions.MANAGE_CATEGORIES),
        },
        body: JSON.stringify({ name: '   ' }),
      });

      const res = await createDepartment(req);
      assert.equal(res.status, 400);
      const data = await res.json();
      assert.ok(data.error.includes('الزامی'));
    });
  });
});
