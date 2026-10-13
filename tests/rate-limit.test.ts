import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { checkRateLimit } from '../src/lib/rate-limit';

describe('Rate Limiter Utility', () => {
  it('allows requests within the specified limit', () => {
    const key = `test-key-${Date.now()}`;
    const limit = 3;
    const windowMs = 60 * 1000;

    const r1 = checkRateLimit(key, limit, windowMs);
    assert.equal(r1.allowed, true);
    assert.equal(r1.remaining, 2);

    const r2 = checkRateLimit(key, limit, windowMs);
    assert.equal(r2.allowed, true);
    assert.equal(r2.remaining, 1);

    const r3 = checkRateLimit(key, limit, windowMs);
    assert.equal(r3.allowed, true);
    assert.equal(r3.remaining, 0);
  });

  it('rejects requests when limit is exceeded and returns retryAfterSeconds', () => {
    const key = `test-exceeded-${Date.now()}`;
    const limit = 2;
    const windowMs = 5000;

    checkRateLimit(key, limit, windowMs);
    checkRateLimit(key, limit, windowMs);

    const exceeded = checkRateLimit(key, limit, windowMs);
    assert.equal(exceeded.allowed, false);
    assert.equal(exceeded.remaining, 0);
    assert.ok(exceeded.retryAfterSeconds > 0 && exceeded.retryAfterSeconds <= 5);
  });
});
