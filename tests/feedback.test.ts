import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { NextRequest } from 'next/server';
import { prisma } from '../src/lib/prisma';
import { POST as submitFeedback, GET as getFeedbackStats } from '../src/app/api/processes/[id]/feedback/route';

const stamp = Date.now().toString(36);
let testProcessId = '';

before(async () => {
  const proc = await prisma.process.create({
    data: {
      title: `فرایند تست بازخورد ${stamp}`,
      slug: `feedback-test-${stamp}`,
      scope: 'software',
      category: 'it',
      description: 'توضیحات تست بازخورد',
    },
  });
  testProcessId = proc.id;
});

after(async () => {
  if (testProcessId) {
    await prisma.processFeedback.deleteMany({ where: { processId: testProcessId } });
    await prisma.process.deleteMany({ where: { id: testProcessId } });
  }
  await prisma.$disconnect();
});

describe('Process Feedback & Outdated UI Reporting API', () => {
  it('returns 400 Bad Request when isHelpful is missing or invalid', async () => {
    const req = new NextRequest(`http://localhost:3000/api/processes/${testProcessId}/feedback`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ reason: 'ui_changed' }),
    });

    const params = Promise.resolve({ id: testProcessId });
    const res = await submitFeedback(req, { params });
    assert.equal(res.status, 400);
    const data = await res.json();
    assert.ok(data.error.includes('مفید بودن'));
  });

  it('returns 404 when process does not exist', async () => {
    const req = new NextRequest('http://localhost:3000/api/processes/non-existent-id/feedback', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ isHelpful: true }),
    });

    const params = Promise.resolve({ id: 'non-existent-id' });
    const res = await submitFeedback(req, { params });
    assert.equal(res.status, 404);
  });

  it('records positive feedback successfully (201 Created)', async () => {
    const req = new NextRequest(`http://localhost:3000/api/processes/${testProcessId}/feedback`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ isHelpful: true }),
    });

    const params = Promise.resolve({ id: testProcessId });
    const res = await submitFeedback(req, { params });
    assert.equal(res.status, 201);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.feedbackId);
  });

  it('records negative feedback with reason and comment', async () => {
    const req = new NextRequest(`http://localhost:3000/api/processes/${testProcessId}/feedback`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        isHelpful: false,
        reason: 'ui_changed',
        comment: 'دکمه تایید به تب مدارک منتقل شده است.',
        stepKey: 'step-1',
      }),
    });

    const params = Promise.resolve({ id: testProcessId });
    const res = await submitFeedback(req, { params });
    assert.equal(res.status, 201);
    const data = await res.json();
    assert.equal(data.success, true);
  });

  it('retrieves aggregated feedback statistics for the process', async () => {
    const req = new NextRequest(`http://localhost:3000/api/processes/${testProcessId}/feedback`, {
      method: 'GET',
    });

    const params = Promise.resolve({ id: testProcessId });
    const res = await getFeedbackStats(req, { params });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.stats.helpfulCount, 1);
    assert.equal(data.stats.unhelpfulCount, 1);
    assert.equal(data.stats.total, 2);
    assert.equal(data.stats.satisfactionRate, 50);
  });
});
