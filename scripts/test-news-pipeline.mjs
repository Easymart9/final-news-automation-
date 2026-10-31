import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { describe, it } from 'node:test';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = await readFile(path.join(root, 'src/lib/automation/pipeline-core.ts'), 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true }
}).outputText;
const pipelineModule = { exports: {} };
new Function('exports', 'require', 'module', compiled)(
  pipelineModule.exports,
  createRequire(import.meta.url),
  pipelineModule
);
const { executeNewsPipelineBatch } = pipelineModule.exports;

const author = { id: 'author-1', name: 'Editorial Desk', slug: 'editorial-desk' };
const topic = { id: 'topic-world', name: 'World News', slug: 'world-news', description: '', iconName: 'Globe', searchDemand: 'HIGH', articleCount: 0 };
const items = [
  { id: 'candidate-1', title: 'Confirmed world report', link: 'https://source.example/story-1', source: 'Test Wire', pubDate: '2026-10-31T08:00:00.000Z', snippet: 'Confirmed detail.', category: 'World News', topicSlug: 'world-news', searchDemandScore: 100, corroboratingSources: [{ sourceName: 'Second Wire', sourceUrl: 'https://second.example/story-1', publishedAt: '2026-10-31T08:01:00.000Z' }] },
  { id: 'candidate-2', title: 'Unverified report', link: 'https://source.example/story-2', source: 'Test Wire', pubDate: '2026-10-31T08:00:00.000Z', snippet: 'Unconfirmed detail.', category: 'World News', topicSlug: 'world-news', searchDemandScore: 90 },
  { id: 'candidate-3', title: 'Story without usable image', link: 'https://source.example/story-3', source: 'Test Wire', pubDate: '2026-10-31T08:00:00.000Z', snippet: 'Verified detail.', category: 'World News', topicSlug: 'world-news', searchDemandScore: 80 },
  { id: 'candidate-4', title: 'Generator failure report', link: 'https://source.example/story-4', source: 'Test Wire', pubDate: '2026-10-31T08:00:00.000Z', snippet: 'Verified detail.', category: 'World News', topicSlug: 'world-news', searchDemandScore: 70 }
];

function createHarness(discoveredItems = items) {
  const state = { articles: [], logs: [], verificationLogs: [], cronRuns: 0, verifyCalls: 0, generateCalls: 0 };
  const db = {
    getArticles: () => [...state.articles],
    getAuthors: () => [author],
    getTopics: () => [topic],
    saveArticle: article => {
      const index = state.articles.findIndex(existing => existing.id === article.id || existing.slug === article.slug);
      if (index >= 0) state.articles[index] = article;
      else state.articles.push(article);
    },
    addAutomationLog: log => state.logs.push(log),
    addVerificationLog: log => state.verificationLogs.push(log),
    updateCronRunTimestamp: () => { state.cronRuns++; }
  };
  const isDuplicate = (candidate, existing) => existing.some(article =>
    article.slug === candidate.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') ||
    article.sources?.some(source => source.sourceUrl === candidate.link)
  );
  const dependencies = {
    db,
    discover: async () => ({ items: discoveredItems, sourceCount: 2, failedSources: [] }),
    verify: async item => {
      state.verifyCalls++;
      const verified = item.title !== 'Unverified report';
      return {
        status: verified ? 'VERIFIED' : 'NEEDS_REVIEW',
        trustScore: verified ? 92 : 35,
        sources: [{ id: `source-${item.id}`, sourceName: item.source, sourceUrl: item.link, claim: item.title, verified }],
        log: { id: `verification-${item.id}`, articleId: '', claim: item.title, status: verified ? 'VERIFIED' : 'NEEDS_REVIEW', score: verified ? 92 : 35, sourcesChecked: 1, matchingSources: verified ? 1 : 0, hallucinationRisk: verified ? 'LOW' : 'HIGH', notes: '', checkedAt: '2026-10-31T08:00:00.000Z' }
      };
    },
    generate: async item => {
      state.generateCalls++;
      if (item.title === 'Generator failure report') throw new Error('simulated provider outage');
      return { title: 'Confirmed world report', slug: 'confirmed-world-report', summary: 'A supported event.', content: '<p>Supported facts.</p>', metaDescription: 'Supported report.', category: item.category, keywords: ['world'], readTimeMinutes: 2, faq: [], aiModelUsed: 'test' };
    },
    selectImage: async (_category, title) => title === 'Story without usable image'
      ? { imageUrl: '', caption: '', altText: '', credit: '', license: '', sourceUrl: '', needsReview: true }
      : { imageUrl: 'https://thumb.wikimedia.org/image.jpg', caption: 'Credit / CC BY 4.0', altText: title, credit: 'Credit', license: 'CC BY 4.0', sourceUrl: 'https://commons.wikimedia.org/wiki/File:Image.jpg', needsReview: false },
    isDuplicate
  };
  return { state, dependencies };
}

describe('automated publishing batch', () => {
  it('publishes only verified stories with a category and licensed image, and continues after item failure', async () => {
    const { state, dependencies } = createHarness();
    const result = await executeNewsPipelineBatch(10, dependencies);

    assert.equal(result.processedCount, 4);
    assert.equal(result.newPublishedCount, 1);
    assert.equal(result.heldInReviewCount, 2);
    assert.equal(result.failedItemsCount, 1);
    assert.equal(result.success, false);
    assert.equal(result.skippedDuplicatesCount, 0);
    assert.equal(state.articles.length, 1);
    assert.equal(state.articles[0].verificationStatus, 'VERIFIED');
    assert.equal(state.articles[0].topicSlug, 'world-news');
    assert.equal(state.articles[0].imageLicense, 'CC BY 4.0');
    assert.equal(state.articles[0].sources.length, 2);
    assert.equal(state.articles[0].sources[1].verified, false);
    assert.equal(state.verificationLogs.length, 1);
    assert.ok(state.logs.some(log => log.taskName === 'Article Processing Failure'));
    assert.equal(state.cronRuns, 1);
  });

  it('skips an already-published source on retry without creating another article', async () => {
    const { state, dependencies } = createHarness([items[0]]);
    const first = await executeNewsPipelineBatch(8, dependencies);
    const second = await executeNewsPipelineBatch(8, dependencies);

    assert.equal(first.newPublishedCount, 1);
    assert.equal(second.newPublishedCount, 0);
    assert.equal(second.skippedDuplicatesCount, 1);
    assert.equal(state.articles.length, 1);
  });
});