import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { describe, it } from 'node:test';
import ts from 'typescript';

const source = await readFile(new URL('../src/lib/services/safe-source-fetch.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ES2022,
    target: ts.ScriptTarget.ES2022
  }
});
const sourceSafety = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);

describe('source-fetch safeguards', () => {
  it('accepts public addresses and rejects private, reserved, and mapped IP ranges', () => {
    for (const address of ['8.8.8.8', '1.1.1.1', '2001:4860:4860::8888']) {
      assert.equal(sourceSafety.isPublicAddress(address), true, `${address} should be public`);
    }
    for (const address of [
      '127.0.0.1', '10.0.0.1', '172.20.0.1', '192.168.1.1', '100.64.0.1',
      '192.0.2.1', '198.51.100.1', '203.0.113.1', '::1', 'fc00::1',
      'fe80::1', '2001:db8::1', '::ffff:7f00:1'
    ]) {
      assert.equal(sourceSafety.isPublicAddress(address), false, `${address} should not be public`);
    }
  });

  it('rejects non-HTTPS and literal-IP source URLs before making a request', async () => {
    await assert.rejects(sourceSafety.fetchNewsSource('http://techcrunch.com/article'), /approved public HTTPS/);
    await assert.rejects(sourceSafety.fetchNewsSource('https://127.0.0.1/article'), /approved public HTTPS/);
  });

  it('enforces response size limits even when content length is declared', async () => {
    const response = new Response('123456', {
      headers: { 'content-length': '6' }
    });
    await assert.rejects(sourceSafety.readLimitedResponse(response, 5), /exceeded the size limit/);
  });
});
