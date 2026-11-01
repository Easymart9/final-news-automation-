import 'server-only';
import { createSign } from 'node:crypto';

const GOOGLE_TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token';
const SEARCH_ANALYTICS_ENDPOINT = 'https://searchconsole.googleapis.com/webmasters/v3/sites';
const SEARCH_CONSOLE_SCOPE = 'https://www.googleapis.com/auth/webmasters.readonly';

interface ServiceAccountCredentials {
  client_email: string;
  private_key: string;
  token_uri?: string;
}

interface SearchAnalyticsRow {
  keys?: string[];
  clicks?: number;
  impressions?: number;
  ctr?: number;
  position?: number;
}

export interface SearchPerformanceReport {
  status: 'ready' | 'not-configured' | 'error';
  message: string;
  siteUrl?: string;
  startDate?: string;
  endDate?: string;
  clicks?: number;
  impressions?: number;
  ctr?: number;
  averagePosition?: number;
  topQueries?: Array<{
    query: string;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  }>;
  opportunities?: Array<{
    query: string;
    page: string;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  }>;
}

let cachedAccessToken: { token: string; expiresAt: number } | undefined;
let cachedReport: { report: SearchPerformanceReport; expiresAt: number } | undefined;

function base64Url(value: string | Buffer): string {
  return Buffer.from(value).toString('base64url');
}

function getCredentials(): ServiceAccountCredentials | undefined {
  const rawCredentials = process.env.GSC_SERVICE_ACCOUNT_JSON?.trim();
  const siteUrl = process.env.GOOGLE_SEARCH_CONSOLE_SITE_URL?.trim();
  if (!rawCredentials || !siteUrl) return undefined;

  let credentials: ServiceAccountCredentials;
  try {
    credentials = JSON.parse(rawCredentials) as ServiceAccountCredentials;
  } catch {
    throw new Error('Search Console service-account credentials are not valid JSON.');
  }
  if (!credentials.client_email || !credentials.private_key) {
    throw new Error('Search Console service-account credentials are incomplete.');
  }
  return credentials;
}

async function getAccessToken(credentials: ServiceAccountCredentials): Promise<string> {
  if (cachedAccessToken && cachedAccessToken.expiresAt > Date.now() + 60_000) {
    return cachedAccessToken.token;
  }

  const issuedAt = Math.floor(Date.now() / 1000);
  const unsignedToken = [
    base64Url(JSON.stringify({ alg: 'RS256', typ: 'JWT' })),
    base64Url(JSON.stringify({
      iss: credentials.client_email,
      scope: SEARCH_CONSOLE_SCOPE,
      aud: credentials.token_uri || GOOGLE_TOKEN_ENDPOINT,
      iat: issuedAt,
      exp: issuedAt + 3600
    }))
  ].join('.');
  const signer = createSign('RSA-SHA256');
  signer.update(unsignedToken);
  const assertion = `${unsignedToken}.${signer.sign(credentials.private_key, 'base64url')}`;
  const response = await fetch(credentials.token_uri || GOOGLE_TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion
    }),
    signal: AbortSignal.timeout(10_000),
    cache: 'no-store'
  });
  if (!response.ok) {
    throw new Error(`Google authorization returned HTTP ${response.status}.`);
  }
  const tokenData = await response.json() as { access_token?: string; expires_in?: number };
  if (!tokenData.access_token) throw new Error('Google authorization did not return an access token.');
  cachedAccessToken = {
    token: tokenData.access_token,
    expiresAt: Date.now() + (tokenData.expires_in || 3600) * 1000
  };
  return cachedAccessToken.token;
}

async function queryAnalytics(
  siteUrl: string,
  accessToken: string,
  startDate: string,
  endDate: string,
  dimensions: string[]
): Promise<SearchAnalyticsRow[]> {
  const response = await fetch(
    `${SEARCH_ANALYTICS_ENDPOINT}/${encodeURIComponent(siteUrl)}/searchAnalytics/query`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        startDate,
        endDate,
        dimensions,
        type: 'web',
        dataState: 'final',
        rowLimit: 25_000
      }),
      signal: AbortSignal.timeout(15_000),
      cache: 'no-store'
    }
  );
  if (!response.ok) {
    throw new Error(`Search Console API returned HTTP ${response.status}. Check property permissions and configuration.`);
  }
  const result = await response.json() as { rows?: SearchAnalyticsRow[] };
  return result.rows || [];
}

function sum(rows: SearchAnalyticsRow[], field: 'clicks' | 'impressions'): number {
  return rows.reduce((total, row) => total + (row[field] || 0), 0);
}

function reportDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export async function getSearchPerformanceReport(): Promise<SearchPerformanceReport> {
  if (cachedReport && cachedReport.expiresAt > Date.now()) return cachedReport.report;
  let credentials: ServiceAccountCredentials | undefined;
  try {
    credentials = getCredentials();
  } catch {
    return {
      status: 'error',
      message: 'Search Console credentials are invalid. Review the server environment configuration.'
    };
  }
  const siteUrl = process.env.GOOGLE_SEARCH_CONSOLE_SITE_URL?.trim();
  if (!credentials || !siteUrl) {
    return {
      status: 'not-configured',
      message: 'Add Search Console service-account credentials and the verified property URL to the server environment.'
    };
  }

  const end = new Date();
  end.setUTCDate(end.getUTCDate() - 3);
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - 27);
  const startDate = reportDate(start);
  const endDate = reportDate(end);

  try {
    const token = await getAccessToken(credentials);
    const [queryRows, pageQueryRows] = await Promise.all([
      queryAnalytics(siteUrl, token, startDate, endDate, ['query']),
      queryAnalytics(siteUrl, token, startDate, endDate, ['query', 'page'])
    ]);
    const clicks = sum(queryRows, 'clicks');
    const impressions = sum(queryRows, 'impressions');
    const weightedPosition = queryRows.reduce(
      (total, row) => total + (row.position || 0) * (row.impressions || 0),
      0
    );
    const opportunities = pageQueryRows
      .filter(row => (row.impressions || 0) >= 20 && (row.position || 0) >= 3 && (row.position || 0) <= 20)
      .sort((first, second) =>
        (second.impressions || 0) - (first.impressions || 0) ||
        (first.position || 0) - (second.position || 0)
      )
      .slice(0, 10)
      .map(row => ({
        query: row.keys?.[0] || '',
        page: row.keys?.[1] || '',
        clicks: row.clicks || 0,
        impressions: row.impressions || 0,
        ctr: row.ctr || 0,
        position: row.position || 0
      }));

    const report: SearchPerformanceReport = {
      status: 'ready',
      message: 'Finalized Google Search Console web data for the previous 28 days.',
      siteUrl,
      startDate,
      endDate,
      clicks,
      impressions,
      ctr: impressions ? clicks / impressions : 0,
      averagePosition: impressions ? weightedPosition / impressions : 0,
      topQueries: [...queryRows]
        .sort((first, second) => (second.impressions || 0) - (first.impressions || 0))
        .slice(0, 10)
        .map(row => ({
          query: row.keys?.[0] || '',
          clicks: row.clicks || 0,
          impressions: row.impressions || 0,
          ctr: row.ctr || 0,
          position: row.position || 0
        })),
      opportunities
    };
    cachedReport = { report, expiresAt: Date.now() + 15 * 60 * 1000 };
    return report;
  } catch {
    return {
      status: 'error',
      message: 'Search Console data could not be loaded. Confirm the verified property, API access, and service-account permissions.'
    };
  }
}
