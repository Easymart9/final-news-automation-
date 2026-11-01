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
const testCronSecret = 'test-secret-for-invalid-limit-route-check-only';
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
    env: { ...process.env, CRON_SECRET: testCronSecret },
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

  it('serves published search records without private article fields', async () => {
    assert.ok(article, 'fixture database must contain a published article');
    const response = await fetch(`${origin}/api/search?q=${encodeURIComponent(article.title.slice(0, 20))}`);
    const results = await response.json();
    assert.equal(response.status, 200);
    assert.ok(results.length > 0 && results.length <= 10);
    assert.ok(results.every((result) =>
      result.id && result.title && result.slug && result.summary && result.publishedAt &&
      !Object.hasOwn(result, 'content') && !Object.hasOwn(result, 'sources')
    ));
  });

  it('serves every configured broad-news category route', async () => {
    const topicSlugs = [
      'india-news', 'world-news', 'breaking-news', 'technology-ai', 'business-finance', 'sports',
      'entertainment-bollywood', 'science-space', 'education-jobs', 'health', 'government-schemes', 'assam-northeast',
      'llm-foundation-models', 'autonomous-ai-agents', 'ai-chips-infrastructure', 'ai-safety-governance',
      'computer-vision-robotics', 'ai-research-science', 'ai-applications-industry', 'ai-business-enterprise',
      'ai-healthcare', 'ai-education'
    ];
    const responses = await Promise.all(topicSlugs.map((slug) => fetch(`${origin}/topics/${slug}`)));
    assert.ok(responses.every((response) => response.status === 200));
    const emptyTopics = topicSlugs.filter(slug =>
      !db.articles.some(item =>
        item.topicSlug === slug && item.verificationStatus === 'VERIFIED' && Date.parse(item.publishedAt) <= Date.now()
      )
    );
    const emptyTopicResponses = await Promise.all(emptyTopics.map(slug => fetch(`${origin}/topics/${slug}`)));
    const emptyTopicHtml = await Promise.all(emptyTopicResponses.map(response => response.text()));
    assert.ok(emptyTopicHtml.every(html => /<meta name="robots" content="noindex, follow"/.test(html)));
  });

  it('serves unique sitemap URLs on the canonical host', async () => {
    const response = await fetch(`${origin}/sitemap.xml`);
    const xml = await response.text();
    const urls = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
    assert.equal(response.status, 200);
    assert.ok(urls.length > 0);
    assert.equal(new Set(urls).size, urls.length);
    assert.ok(urls.every((url) => new URL(url).origin === baseUrl));
    const emptyTopicSlugs = [
      'india-news', 'world-news', 'breaking-news', 'technology-ai', 'business-finance', 'sports',
      'entertainment-bollywood', 'science-space', 'education-jobs', 'health', 'government-schemes',
      'assam-northeast', 'llm-foundation-models', 'autonomous-ai-agents', 'ai-chips-infrastructure',
      'ai-safety-governance', 'computer-vision-robotics', 'ai-research-science',
      'ai-applications-industry', 'ai-business-enterprise', 'ai-healthcare', 'ai-education'
    ].filter(slug => !db.articles.some(item =>
      item.topicSlug === slug && item.verificationStatus === 'VERIFIED' && Date.parse(item.publishedAt) <= Date.now()
    ));
    assert.ok(emptyTopicSlugs.every(slug => !urls.includes(`${baseUrl}/topics/${slug}`)));
    assert.ok(urls.includes(`${baseUrl}/affiliate-disclosure`));
    const policyResponse = await fetch(`${origin}/editorial-standards`);
    const policyHtml = await policyResponse.text();
    assert.equal(policyResponse.status, 200);
    assert.match(policyHtml, new RegExp(`<link rel="canonical" href="${baseUrl}/editorial-standards"`));
    const disclosureResponse = await fetch(`${origin}/affiliate-disclosure`);
    const disclosureHtml = await disclosureResponse.text();
    assert.equal(disclosureResponse.status, 200);
    assert.match(disclosureHtml, new RegExp(`<link rel="canonical" href="${baseUrl}/affiliate-disclosure"`));
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

  it('rejects unauthenticated admin mutations', async () => {
    const response = await fetch(`${origin}/api/admin/change-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword: 'invalid', newPassword: 'invalid-password' })
    });
    assert.equal(response.status, 401);
  });

  it('bounds admin sign-in input before password verification', async () => {
    const oversizedResponse = await fetch(`${origin}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'a'.repeat(5000) })
    });
    assert.equal(oversizedResponse.status, 413);

    const malformedResponse = await fetch(`${origin}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{'
    });
    assert.equal(malformedResponse.status, 400);
  });

  it('blocks cross-origin contact posts and validates form payloads', async () => {
    const crossOriginResponse = await fetch(`${origin}/api/contact`, {
      method: 'POST',
      headers: { Origin: 'https://attacker.example', 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    assert.equal(crossOriginResponse.status, 403);

    const invalidPayloadResponse = await fetch(`${origin}/api/contact`, {
      method: 'POST',
      headers: { Origin: origin, 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    assert.equal(invalidPayloadResponse.status, 400);
  });

  it('rejects cron requests without a bearer secret', async () => {
    const response = await fetch(`${origin}/api/cron/run`, { method: 'POST' });
    assert.equal(response.status, 401);
  });

  it('rejects invalid authenticated cron batch limits without running the pipeline', async () => {
    const response = await fetch(`${origin}/api/cron/run?limit=4`, {
      headers: { authorization: `Bearer ${testCronSecret}` }
    });
    assert.equal(response.status, 400);
  });
});