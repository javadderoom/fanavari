import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { hashPassword, verifyPassword, isValidPassword } from '../src/lib/password';

describe('password hashing (scrypt)', () => {
  it('verifies a correct password and rejects a wrong one', async () => {
    const hash = await hashPassword('correct-horse-123');
    assert.equal(await verifyPassword('correct-horse-123', hash), true);
    assert.equal(await verifyPassword('wrong-password', hash), false);
  });

  it('uses unique salts per hash', async () => {
    const a = await hashPassword('same-password');
    const b = await hashPassword('same-password');
    assert.notEqual(a, b);
  });

  it('rejects malformed stored hashes', async () => {
    assert.equal(await verifyPassword('anything', 'not-a-hash'), false);
    assert.equal(await verifyPassword('anything', ''), false);
  });
});

describe('isValidPassword', () => {
  it('requires 8+ characters', () => {
    assert.equal(isValidPassword('12345678'), true);
    assert.equal(isValidPassword('1234567'), false);
    assert.equal(isValidPassword(''), false);
  });
});
