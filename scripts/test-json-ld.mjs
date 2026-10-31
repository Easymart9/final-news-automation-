import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { describe, it } from 'node:test';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = await readFile(path.join(root, 'src/lib/services/seo-engine.ts'), 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true }
}).outputText;
const seoModule = { exports: {} };
new Function('exports', 'require', 'module', compiled)(
  seoModule.exports,
  createRequire(import.meta.url),
  seoModule
);
const { serializeJsonLd } = seoModule.exports;

describe('JSON-LD serialization', () => {
  it('escapes characters that could terminate the script element', () => {
    const serialized = serializeJsonLd({ headline: '</script><script>alert(1)</script>', text: 'A & B' });

    assert.doesNotMatch(serialized, /<|>|&/);
    assert.deepEqual(JSON.parse(serialized), {
      headline: '</script><script>alert(1)</script>',
      text: 'A & B'
    });
  });
});