import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { describe, it } from 'node:test';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = await readFile(path.join(root, 'src/lib/services/news-researcher.ts'), 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true }
}).outputText;
const researcherModule = { exports: {} };
new Function('exports', 'require', 'module', compiled)(
  researcherModule.exports,
  createRequire(import.meta.url),
  researcherModule
);
const { NEWS_FEEDS, getNewsItemCategory, isDuplicateNewsItem, normalizeNewsUrl } = researcherModule.exports;

describe('news research and trending classification', () => {
  it('configures feeds for every requested coverage desk', () => {
    const categories = new Set(NEWS_FEEDS.map(feed => feed.category));
    categories.add('Breaking News');
    for (const category of [
      'India News', 'World News', 'Breaking News', 'Technology & AI', 'Business & Finance', 'Sports',
      'Entertainment & Bollywood', 'Science & Space', 'Education & Jobs', 'Health', 'Government Schemes',
      'Assam & Northeast India'
    ]) assert.ok(categories.has(category), `${category} needs a configured feed`);
  });

  it('labels breaking only with an urgency signal inside six hours', () => {
    const feed = NEWS_FEEDS.find(item => item.name === 'BBC Top Stories');
    assert.ok(feed);
    assert.deepEqual(getNewsItemCategory(feed, 'Breaking: emergency services respond', 2 * 60 * 60 * 1000), {
      category: 'Breaking News', topicSlug: 'breaking-news'
    });
    assert.deepEqual(getNewsItemCategory(feed, 'Breaking: emergency services respond', 7 * 60 * 60 * 1000), {
      category: 'World News', topicSlug: 'world-news'
    });
    assert.deepEqual(getNewsItemCategory(feed, 'Ordinary headline', 1 * 60 * 60 * 1000), {
      category: 'World News', topicSlug: 'world-news'
    });
  });

  it('filters MyGov items that are not about schemes or benefits', () => {
    const feed = NEWS_FEEDS.find(item => item.name === 'MyGov India');
    assert.ok(feed);
    assert.equal(getNewsItemCategory(feed, 'PM inaugurates a science conclave', 0), null);
    assert.deepEqual(getNewsItemCategory(feed, 'New scholarship scheme opens for students', 0), {
      category: 'Government Schemes', topicSlug: 'government-schemes'
    });
  });

  it('normalizes tracking links and detects near-duplicate titles', () => {
    assert.equal(
      normalizeNewsUrl('https://www.example.com/story/?utm_source=rss&id=4#top'),
      normalizeNewsUrl('https://example.com/story?id=4')
    );
    const article = {
      slug: 'india-launches-new-rural-health-programme-for-remote-districts',
      title: 'India launches new rural health programme for remote districts',
      sources: [{ sourceUrl: 'https://example.com/first-report' }]
    };
    assert.equal(isDuplicateNewsItem({
      title: 'India launches a new rural health programme for remote districts',
      link: 'https://another-source.com/report'
    }, [article]), true);
    assert.equal(isDuplicateNewsItem({ title: 'A separate space telescope discovers distant planets', link: 'https://example.com/new' }, [article]), false);
  });
});