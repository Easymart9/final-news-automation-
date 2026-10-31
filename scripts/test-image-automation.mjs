import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { describe, it } from 'node:test';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = await readFile(path.join(root, 'src/lib/services/image-automation.ts'), 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }
}).outputText;
const imageModule = { exports: {} };
new Function('exports', 'require', 'module', compiled)(
  imageModule.exports,
  createRequire(import.meta.url),
  imageModule
);
const { fetchFeaturedImage } = imageModule.exports;

describe('automated featured-image assignment', () => {
  it('chooses a distinct image until the category pool is exhausted', () => {
    const assigned = new Set();
    let availableCount = 0;

    for (let index = 0; index < 12; index++) {
      const result = fetchFeaturedImage('LLMs & Foundation Models', `Story ${index}`, assigned);
      if (result.needsReview) {
        assert.equal(result.imageUrl, '');
        continue;
      }

      assert.ok(result.imageUrl.startsWith('https://images.unsplash.com/'));
      assert.equal(assigned.has(result.imageUrl), false);
      assert.equal(result.caption, 'Illustrative image');
      assigned.add(result.imageUrl);
      availableCount++;
    }

    assert.equal(availableCount, 8);
  });

  it('does not reassign the same source image with different query parameters', () => {
    const usedImage = fetchFeaturedImage('AI Chips & Infrastructure', 'First story');
    const alternateUrl = `${usedImage.imageUrl}&utm_source=test`;
    const nextImage = fetchFeaturedImage('AI Chips & Infrastructure', 'Second story', [alternateUrl]);

    assert.notEqual(nextImage.imageUrl.split('?')[0], alternateUrl.split('?')[0]);
  });
});