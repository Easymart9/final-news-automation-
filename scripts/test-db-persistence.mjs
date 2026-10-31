import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { after, describe, it } from 'node:test';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const tempDirectory = await mkdtemp(path.join(os.tmpdir(), 'worldbulletin-db-test-'));
const originalDatabasePath = process.env.DATABASE_PATH;
process.env.DATABASE_PATH = path.join(tempDirectory, 'persistent', 'articles.json');
const source = await readFile(path.join(root, 'src/lib/db/index.ts'), 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true }
}).outputText;

function loadDatabaseModule() {
  const databaseModule = { exports: {} };
  new Function('exports', 'require', 'module', compiled)(
    databaseModule.exports,
    createRequire(import.meta.url),
    databaseModule
  );
  return databaseModule.exports.db;
}

after(async () => {
  if (originalDatabasePath === undefined) delete process.env.DATABASE_PATH;
  else process.env.DATABASE_PATH = originalDatabasePath;
  await rm(tempDirectory, { recursive: true, force: true });
});

describe('persistent JSON database path', () => {
  it('saves an article to the configured path and reads it after module reload', () => {
    const database = loadDatabaseModule();
    const author = database.getAuthors()[0];
    const timestamp = new Date().toISOString();
    database.saveArticle({
      id: 'persistence-test-article',
      title: 'Persistence test report',
      slug: 'persistence-test-report',
      summary: 'Database persistence test.',
      content: '<p>Test content.</p>',
      metaDescription: 'Database persistence test.',
      category: 'World News',
      topicSlug: 'world-news',
      trustScore: 90,
      verificationStatus: 'VERIFIED',
      featuredImage: 'https://example.test/image.jpg',
      imageCaption: '',
      author,
      sources: [],
      publishedAt: timestamp,
      updatedAt: timestamp,
      readTimeMinutes: 1,
      views: 0,
      isFeatured: false,
      keywords: [],
      faq: []
    });

    const restartedDatabase = loadDatabaseModule();
    assert.equal(restartedDatabase.getPublishedArticleBySlug('persistence-test-report')?.id, 'persistence-test-article');
  });
});