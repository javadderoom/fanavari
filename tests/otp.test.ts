import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizePhone,
  normalizeEmail,
  maskContact,
  generateOtpCode,
  hashOtpCode,
} from '../src/lib/otp';

describe('normalizePhone', () => {
  it('accepts 09... national format', () => {
    assert.equal(normalizePhone('09123456789'), '+989123456789');
  });

  it('accepts +98, 0098 and bare 98 prefixes', () => {
    assert.equal(normalizePhone('+989123456789'), '+989123456789');
    assert.equal(normalizePhone('00989123456789'), '+989123456789');
    assert.equal(normalizePhone('989123456789'), '+989123456789');
  });

  it('accepts Persian digits, spaces and dashes', () => {
    assert.equal(normalizePhone('۰۹۱۲ ۳۴۵ ۶۷۸۹'), '+989123456789');
    assert.equal(normalizePhone('0912-345-6789'), '+989123456789');
  });

  it('rejects landlines, short numbers and non-mobiles', () => {
    assert.equal(normalizePhone('02122334455'), null);
    assert.equal(normalizePhone('0912345678'), null);
    assert.equal(normalizePhone('not-a-phone'), null);
    assert.equal(normalizePhone(''), null);
    assert.equal(normalizePhone(null), null);
  });
});

describe('normalizeEmail', () => {
  it('trims and lowercases valid emails', () => {
    assert.equal(normalizeEmail('  Ali@Example.COM '), 'ali@example.com');
  });

  it('rejects invalid emails', () => {
    assert.equal(normalizeEmail('no-at-sign'), null);
    assert.equal(normalizeEmail('a@b'), null);
    assert.equal(normalizeEmail(null), null);
  });
});

describe('maskContact', () => {
  it('masks emails like the lookup API', () => {
    assert.equal(maskContact('admin@fanavari.local'), 'ad***@fanavari.local');
  });

  it('masks phones showing head and tail only', () => {
    assert.equal(maskContact('+989123456789'), '9891***6789');
  });
});

describe('OTP code generation and hashing', () => {
  it('generates 6-digit numeric codes', () => {
    const code = generateOtpCode();
    assert.match(code, /^\d{6}$/);
  });

  it('hashes deterministically and differs per code', () => {
    assert.equal(hashOtpCode('123456'), hashOtpCode('123456'));
    assert.notEqual(hashOtpCode('123456'), hashOtpCode('654321'));
    assert.equal(hashOtpCode('123456').length, 64);
  });
});
