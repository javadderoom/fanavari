import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'crypto';
import {
  base64UrlEncode,
  normalizePrivateKey,
  createGoogleSignedJwt,
  getGoogleIndexingConfig,
  notifyGoogleIndexing,
  batchNotifyGoogleIndexing,
} from '../src/lib/google-indexing';

describe('Google Indexing API Helper', () => {
  it('should encode base64url without padding or unsafe characters', () => {
    const raw = 'Hello World! This is a test for indexing 12345+/?=';
    const encoded = base64UrlEncode(raw);

    assert.ok(!encoded.includes('='));
    assert.ok(!encoded.includes('+'));
    assert.ok(!encoded.includes('/'));
    assert.equal(
      Buffer.from(encoded, 'base64url').toString('utf-8'),
      raw
    );
  });

  it('should normalize private key with escaped newlines and quotes', () => {
    const rawKey = '"-----BEGIN RSA PRIVATE KEY-----\\nMIIEowIBAAKCAQEA...\\n-----END RSA PRIVATE KEY-----\\n"';
    const normalized = normalizePrivateKey(rawKey);

    assert.ok(!normalized.startsWith('"'));
    assert.ok(!normalized.endsWith('"'));
    assert.ok(normalized.includes('\n'));
    assert.ok(!normalized.includes('\\n'));
  });

  it('should create and sign a valid RS256 JWT assertion', () => {
    // Generate a temporary 2048-bit RSA key pair for testing signature verification
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    });

    const clientEmail = 'service-account@farayandnama-indexing.iam.gserviceaccount.com';
    const jwt = createGoogleSignedJwt(clientEmail, privateKey);

    const parts = jwt.split('.');
    assert.equal(parts.length, 3, 'JWT must have header, payload, and signature');

    // Decode header & claims
    const header = JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf-8'));
    const claims = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf-8'));

    assert.equal(header.alg, 'RS256');
    assert.equal(header.typ, 'JWT');
    assert.equal(claims.iss, clientEmail);
    assert.equal(claims.scope, 'https://www.googleapis.com/auth/indexing');
    assert.equal(claims.aud, 'https://oauth2.googleapis.com/token');
    assert.ok(claims.exp > claims.iat);

    // Verify cryptographic signature
    const verifier = crypto.createVerify('RSA-SHA256');
    verifier.update(`${parts[0]}.${parts[1]}`);
    verifier.end();
    const verified = verifier.verify(publicKey, Buffer.from(parts[2], 'base64url'));
    assert.equal(verified, true, 'Cryptographic RSA-SHA256 signature must be verified by public key');
  });

  it('should return unconfigured status when env vars are missing', () => {
    const origEmail = process.env.GOOGLE_INDEXING_CLIENT_EMAIL;
    const origKey = process.env.GOOGLE_INDEXING_PRIVATE_KEY;

    try {
      delete process.env.GOOGLE_INDEXING_CLIENT_EMAIL;
      delete process.env.GOOGLE_INDEXING_PRIVATE_KEY;

      const config = getGoogleIndexingConfig();
      assert.equal(config.configured, false);
      assert.equal(config.clientEmail, null);
      assert.equal(config.hasPrivateKey, false);
    } finally {
      if (origEmail) process.env.GOOGLE_INDEXING_CLIENT_EMAIL = origEmail;
      if (origKey) process.env.GOOGLE_INDEXING_PRIVATE_KEY = origKey;
    }
  });

  it('should gracefully skip notifyGoogleIndexing without throwing when unconfigured', async () => {
    const origEmail = process.env.GOOGLE_INDEXING_CLIENT_EMAIL;
    const origKey = process.env.GOOGLE_INDEXING_PRIVATE_KEY;

    try {
      delete process.env.GOOGLE_INDEXING_CLIENT_EMAIL;
      delete process.env.GOOGLE_INDEXING_PRIVATE_KEY;

      const result = await notifyGoogleIndexing({
        url: '/process/sample-test-process',
        type: 'URL_UPDATED',
      });

      assert.equal(result.success, false);
      assert.equal(result.skipped, true);
      assert.ok(result.url.includes('/process/sample-test-process'));
      assert.ok(result.error?.includes('credentials not configured'));
    } finally {
      if (origEmail) process.env.GOOGLE_INDEXING_CLIENT_EMAIL = origEmail;
      if (origKey) process.env.GOOGLE_INDEXING_PRIVATE_KEY = origKey;
    }
  });

  it('should batch notify multiple URLs with concurrency and report summary', async () => {
    const origEmail = process.env.GOOGLE_INDEXING_CLIENT_EMAIL;
    const origKey = process.env.GOOGLE_INDEXING_PRIVATE_KEY;

    try {
      delete process.env.GOOGLE_INDEXING_CLIENT_EMAIL;
      delete process.env.GOOGLE_INDEXING_PRIVATE_KEY;

      const summary = await batchNotifyGoogleIndexing({
        urls: [
          '/process/step-1',
          '/process/step-2',
          '/information/announcement-1',
          '/tools/exam-pdf',
        ],
        type: 'URL_UPDATED',
        concurrency: 2,
      });

      assert.equal(summary.total, 4);
      assert.equal(summary.skipped, 4);
      assert.equal(summary.failed, 0);
      assert.equal(summary.succeeded, 0);
      assert.equal(summary.results.length, 4);
    } finally {
      if (origEmail) process.env.GOOGLE_INDEXING_CLIENT_EMAIL = origEmail;
      if (origKey) process.env.GOOGLE_INDEXING_PRIVATE_KEY = origKey;
    }
  });
});
