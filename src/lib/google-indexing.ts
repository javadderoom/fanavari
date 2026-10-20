import crypto from 'crypto';

export type IndexingNotificationType = 'URL_UPDATED' | 'URL_DELETED';

export interface IndexingResult {
  url: string;
  type: IndexingNotificationType;
  success: boolean;
  skipped?: boolean;
  status?: number;
  data?: any;
  error?: string;
  timestamp: string;
}

export interface GoogleIndexingConfig {
  configured: boolean;
  clientEmail: string | null;
  hasPrivateKey: boolean;
  appUrl: string;
}

// In-memory token cache to avoid requesting an OAuth2 token on every call
let cachedToken: {
  accessToken: string;
  expiresAt: number; // Unix timestamp in ms
} | null = null;

/**
 * Returns configuration status of Google Indexing API credentials.
 */
export function getGoogleIndexingConfig(): GoogleIndexingConfig {
  const clientEmail = process.env.GOOGLE_INDEXING_CLIENT_EMAIL?.trim() || null;
  const privateKey = process.env.GOOGLE_INDEXING_PRIVATE_KEY?.trim() || null;
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://farayandnama.ir').replace(/\/+$/, '');

  const configured = Boolean(clientEmail && privateKey);

  return {
    configured,
    clientEmail,
    hasPrivateKey: Boolean(privateKey),
    appUrl,
  };
}

/**
 * Checks if Google Indexing credentials are fully configured and enabled.
 */
export function isGoogleIndexingConfigured(): boolean {
  return getGoogleIndexingConfig().configured;
}

/**
 * Utility: URL-safe Base64 encoding without padding.
 */
export function base64UrlEncode(input: string | Buffer): string {
  const buffer = typeof input === 'string' ? Buffer.from(input, 'utf-8') : input;
  return buffer
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

/**
 * Formats a private key string, resolving escaped newlines (\n) commonly found in env variables.
 */
export function normalizePrivateKey(rawKey: string): string {
  let key = rawKey.trim();
  // Strip surrounding quotes if present
  if ((key.startsWith('"') && key.endsWith('"')) || (key.startsWith("'") && key.endsWith("'"))) {
    key = key.slice(1, -1);
  }
  return key.replace(/\\n/g, '\n');
}

/**
 * Generates an RS256 signed JWT assertion for Google OAuth2 token exchange using Node.js crypto.
 */
export function createGoogleSignedJwt(clientEmail: string, privateKey: string): string {
  const now = Math.floor(Date.now() / 1000);
  const header = {
    alg: 'RS256',
    typ: 'JWT',
  };

  const claimSet = {
    iss: clientEmail,
    scope: 'https://www.googleapis.com/auth/indexing',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600, // 1 hour validity
    iat: now,
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedClaimSet = base64UrlEncode(JSON.stringify(claimSet));
  const unsignedToken = `${encodedHeader}.${encodedClaimSet}`;

  const signer = crypto.createSign('RSA-SHA256');
  signer.update(unsignedToken);
  signer.end();

  const formattedKey = normalizePrivateKey(privateKey);
  const signature = signer.sign(formattedKey);
  const encodedSignature = base64UrlEncode(signature);

  return `${unsignedToken}.${encodedSignature}`;
}

/**
 * Obtains a Google OAuth2 Bearer token scoped for the Indexing API.
 * Uses an in-memory cache to reuse valid tokens.
 */
export async function getGoogleIndexingAccessToken(): Promise<string> {
  const { configured, clientEmail, appUrl } = getGoogleIndexingConfig();
  const privateKey = process.env.GOOGLE_INDEXING_PRIVATE_KEY?.trim();

  if (!configured || !clientEmail || !privateKey) {
    throw new Error('Google Indexing API credentials are not configured.');
  }

  // Reuse cached token if it has at least 2 minutes remaining before expiration
  const now = Date.now();
  if (cachedToken && cachedToken.expiresAt - now > 120_000) {
    return cachedToken.accessToken;
  }

  const assertion = createGoogleSignedJwt(clientEmail, privateKey);
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to obtain Google access token: HTTP ${response.status} - ${errorText}`);
  }

  const data = (await response.json()) as { access_token: string; expires_in: number };
  cachedToken = {
    accessToken: data.access_token,
    expiresAt: now + data.expires_in * 1000,
  };

  return data.access_token;
}

/**
 * Sends a single URL notification (URL_UPDATED or URL_DELETED) to Google Indexing API.
 * Never throws an unhandled exception: gracefully reports skipped/error statuses.
 */
export async function notifyGoogleIndexing({
  url,
  type = 'URL_UPDATED',
}: {
  url: string;
  type?: IndexingNotificationType;
}): Promise<IndexingResult> {
  const timestamp = new Date().toISOString();
  const config = getGoogleIndexingConfig();

  // Validate or build full URL
  let targetUrl = url.trim();
  if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
    targetUrl = `${config.appUrl}${targetUrl.startsWith('/') ? '' : '/'}${targetUrl}`;
  }

  if (!config.configured) {
    return {
      url: targetUrl,
      type,
      success: false,
      skipped: true,
      error: 'Google Indexing credentials not configured (GOOGLE_INDEXING_CLIENT_EMAIL / GOOGLE_INDEXING_PRIVATE_KEY missing).',
      timestamp,
    };
  }

  try {
    const accessToken = await getGoogleIndexingAccessToken();
    const response = await fetch('https://indexing.googleapis.com/v3/urlNotifications:publish', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        url: targetUrl,
        type,
      }),
    });

    const responseBody = await response.json().catch(() => null);

    if (!response.ok) {
      return {
        url: targetUrl,
        type,
        success: false,
        status: response.status,
        error: responseBody?.error?.message || `HTTP ${response.status}`,
        data: responseBody,
        timestamp,
      };
    }

    return {
      url: targetUrl,
      type,
      success: true,
      status: response.status,
      data: responseBody,
      timestamp,
    };
  } catch (error: any) {
    return {
      url: targetUrl,
      type,
      success: false,
      error: error.message || 'Unknown error notifying Google Indexing API',
      timestamp,
    };
  }
}

/**
 * Submits multiple URLs to Google Indexing API with controlled concurrency.
 */
export async function batchNotifyGoogleIndexing({
  urls,
  type = 'URL_UPDATED',
  concurrency = 3,
}: {
  urls: string[];
  type?: IndexingNotificationType;
  concurrency?: number;
}): Promise<{
  total: number;
  succeeded: number;
  failed: number;
  skipped: number;
  results: IndexingResult[];
}> {
  const uniqueUrls = Array.from(new Set(urls.map((u) => u.trim()).filter(Boolean)));
  const results: IndexingResult[] = [];

  for (let i = 0; i < uniqueUrls.length; i += concurrency) {
    const batch = uniqueUrls.slice(i, i + concurrency);
    const batchResults = await Promise.all(
      batch.map((url) => notifyGoogleIndexing({ url, type }))
    );
    results.push(...batchResults);
  }

  const succeeded = results.filter((r) => r.success).length;
  const skipped = results.filter((r) => r.skipped).length;
  const failed = results.length - succeeded - skipped;

  return {
    total: results.length,
    succeeded,
    failed,
    skipped,
    results,
  };
}

/**
 * Queries Google Indexing API metadata for a specific URL (to check status and latest notify time).
 */
export async function getGoogleIndexingMetadata(url: string): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  const config = getGoogleIndexingConfig();
  let targetUrl = url.trim();
  if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
    targetUrl = `${config.appUrl}${targetUrl.startsWith('/') ? '' : '/'}${targetUrl}`;
  }

  if (!config.configured) {
    return {
      success: false,
      error: 'Google Indexing credentials not configured.',
    };
  }

  try {
    const accessToken = await getGoogleIndexingAccessToken();
    const endpoint = `https://indexing.googleapis.com/v3/urlNotifications/metadata?url=${encodeURIComponent(
      targetUrl
    )}`;

    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      return {
        success: false,
        error: data?.error?.message || `HTTP ${response.status}`,
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to query Google indexing metadata',
    };
  }
}
