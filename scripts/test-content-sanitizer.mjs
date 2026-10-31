import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { describe, it } from 'node:test';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = await readFile(path.join(root, 'src/lib/services/content-sanitizer.ts'), 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true }
}).outputText;
const sanitizerModule = { exports: {} };
new Function('exports', 'require', 'module', compiled)(
  sanitizerModule.exports,
  createRequire(import.meta.url),
  sanitizerModule
);
const { sanitizeArticleContent } = sanitizerModule.exports;

describe('article content sanitization', () => {
  it('removes scripts, event handlers, and unsafe link schemes while retaining article markup', () => {
    const result = sanitizeArticleContent(
      '<h2>Confirmed details</h2><script>alert(1)</script><p onclick="alert(2)">Facts</p>' +
      '<a href="javascript:alert(3)">Source</a><a href="https://example.com">More</a>'
    );

    assert.match(result, /<h2>Confirmed details<\/h2>/);
    assert.match(result, /<p>Facts<\/p>/);
    assert.doesNotMatch(result, /script|onclick|javascript:/i);
    assert.match(result, /href="https:\/\/example\.com"/);
    assert.match(result, /rel="noopener noreferrer"/);
  });
});