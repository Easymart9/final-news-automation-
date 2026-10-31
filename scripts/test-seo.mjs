import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { get as httpGet } from 'node:http';
import { createServer } from 'node:net';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { after, before, describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const baseUrl = 'https://worldbulletin.world';
const db = JSON.parse(await readFile(path.join(root, 'data/db.json'), 'utf8'));
const article = db.articles.find((item) =>
  item.verificationStatus === 'VERIFIED' && Date.parse(item.publishedAt) <= Date.now()
);
let serverProcess;
let origin;

async function getAvailablePort() {
  const server = createServer();
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  const { port } = server.address();
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  return port;
}

function requestWithHost(url, host) {
  return new Promise((resolve, reject) => {
    httpGet(url, { headers: { host } }, resolve).once('error', reject);
  });
}

before(async () => {
  const port = await getAvailablePort();
  origin = `http://127.0.0.1:${port}`;
  serverProcess = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '--hostname', '127.0.0.1', '--port', String(port)], {
    cwd: root,
    stdio: 'ignore',
  });

  for (let attempt = 0; attempt < 40; attempt += 1) {
    if (serverProcess.exitCode !== null) {
      throw new Error(`Next.js server exited with code ${serverProcess.exitCode}`);
    }
    try {
      const response = await fetch(origin);
      if (response.ok) return;
    } catch {}
    await delay(250);
  }
  throw new Error('Next.js server did not become ready');
});

after(async () => {
  if (!serverProcess || serverProcess.exitCode !== null) return;
  serverProcess.kill('SIGTERM');
  await new Promise((resolve) => serverProcess.once('exit', resolve));
});

describe('production SEO responses', () => {
  it('serves a self-canonical homepage', async () => {
    const response = await fetch(origin);
    const html = await response.text();
    assert.equal(response.status, 200);
    assert.match(html, new RegExp(`<link rel="canonical" href="${baseUrl}"`));
  });

  it('redirects www requests to the canonical host and preserves paths', async () => {
    const response = await requestWithHost(`${origin}/about?edition=world`, 'www.worldbulletin.world');
    assert.equal(response.statusCode, 308);
    assert.equal(response.headers.location, `${baseUrl}/about?edition=world`);
    response.resume();
  });

  it('serves published articles with self-canonical URLs', async () => {
    assert.ok(article, 'fixture database must contain a published article');
    const response = await fetch(`${origin}/news/${article.slug}`);
    const html = await response.text();
    assert.equal(response.status, 200);
    assert.match(html, new RegExp(`<link rel="canonical" href="${baseUrl}/news/${article.slug}"`));
  });

  it('returns 404 for an unknown article slug', async () => {
    const response = await fetch(`${origin}/news/seo-regression-test-missing-article`);
    assert.equal(response.status, 404);
  });

  it('uses a page-specific canonical and 404s out-of-range topic pagination', async () => {
    const topicSlug = db.articles[0].topicSlug;
    const response = await fetch(`${origin}/topics/${topicSlug}?page=2`);
    assert.equal(response.status, 404);

    const firstPageResponse = await fetch(`${origin}/topics/${topicSlug}?page=1`);
    const firstPageHtml = await firstPageResponse.text();
    assert.equal(firstPageResponse.status, 200);
    assert.match(firstPageHtml, new RegExp(`<link rel="canonical" href="${baseUrl}/topics/${topicSlug}"`));
  });

  it('serves every configured broad-news category route', async () => {
    const topicSlugs = [
      'india-news', 'world-news', 'breaking-news', 'technology-ai', 'business-finance', 'sports',
      'entertainment-bollywood', 'science-space', 'education-jobs', 'health', 'government-schemes', 'assam-northeast'
    ];
    const responses = await Promise.all(topicSlugs.map((slug) => fetch(`${origin}/topics/${slug}`)));
    assert.ok(responses.every((response) => response.status === 200));
  });

  it('serves unique sitemap URLs on the canonical host', async () => {
    const response = await fetch(`${origin}/sitemap.xml`);
    const xml = await response.text();
    const urls = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
    assert.equal(response.status, 200);
    assert.ok(urls.length > 0);
    assert.equal(new Set(urls).size, urls.length);
    assert.ok(urls.every((url) => new URL(url).origin === baseUrl));
    const policyResponse = await fetch(`${origin}/editorial-standards`);
    const policyHtml = await policyResponse.text();
    assert.equal(policyResponse.status, 200);
    assert.match(policyHtml, new RegExp(`<link rel="canonical" href="${baseUrl}/editorial-standards"`));
  });

  it('serves robots directives that advertise both sitemaps', async () => {
    const response = await fetch(`${origin}/robots.txt`);
    const body = await response.text();
    assert.equal(response.status, 200);
    assert.match(body, /Disallow: \/admin\//);
    assert.match(body, new RegExp(`Sitemap: ${baseUrl}/sitemap\\.xml`));
    assert.match(body, new RegExp(`Sitemap: ${baseUrl}/google-news-sitemap\\.xml`));
  });

  it('excludes stale and future stories from the Google News sitemap', async () => {
    const response = await fetch(`${origin}/google-news-sitemap.xml`);
    const xml = await response.text();
    const dates = [...xml.matchAll(/<news:publication_date>(.*?)<\/news:publication_date>/g)]
      .map((match) => Date.parse(match[1]));
    const now = Date.now();
    assert.equal(response.status, 200);
    assert.ok(dates.every((date) => Number.isFinite(date) && date >= now - 48 * 60 * 60 * 1000 && date <= now));
  });

  it('rejects unauthenticated manual automation requests', async () => {
    const response = await fetch(`${origin}/api/automation/run`, { method: 'POST' });
    assert.equal(response.status, 401);
  });

  it('rejects cron requests without a bearer secret', async () => {
    const response = await fetch(`${origin}/api/cron/run`, { method: 'POST' });
    assert.equal(response.status, 401);
  });
});