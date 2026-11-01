import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { after, describe, it } from 'node:test';
import ts from 'typescript';

const source = await readFile(new URL('../src/lib/services/ai-providers.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ES2022,
    target: ts.ScriptTarget.ES2022
  }
});
const providers = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);
const providerEnvKeys = [
  'GROQ_API_KEY', 'GEMINI_API_KEY', 'MISTRAL_API_KEY', 'OPENROUTER_API_KEY', 'SAMBANOVA_API_KEY',
  'GROQ_MODEL', 'GEMINI_MODEL', 'MISTRAL_MODEL', 'OPENROUTER_MODEL', 'SAMBANOVA_MODEL',
  'GROQ_FREE_TIER_CONFIRMED', 'GEMINI_FREE_TIER_CONFIRMED', 'MISTRAL_FREE_TIER_CONFIRMED',
  'OPENROUTER_FREE_TIER_CONFIRMED', 'SAMBANOVA_FREE_TIER_CONFIRMED', 'AI_PROVIDER_ORDER'
];
const originalEnv = new Map(providerEnvKeys.map(key => [key, process.env[key]]));
const originalFetch = globalThis.fetch;

after(() => {
  clearProviders();
  for (const [key, value] of originalEnv) {
    if (value !== undefined) process.env[key] = value;
  }
  globalThis.fetch = originalFetch;
});

function clearProviders() {
  for (const key of providerEnvKeys) delete process.env[key];
}

describe('AI provider fallback', () => {
  it('uses the next explicitly enabled provider after a request failure', async () => {
    clearProviders();
    process.env.GROQ_API_KEY = 'test-groq-key';
    process.env.GROQ_FREE_TIER_CONFIRMED = 'true';
    process.env.GEMINI_API_KEY = 'test-gemini-key';
    process.env.GEMINI_FREE_TIER_CONFIRMED = 'true';
    process.env.AI_PROVIDER_ORDER = 'groq,gemini';
    const calls = [];
    globalThis.fetch = async (input) => {
      const url = String(input);
      calls.push(url);
      if (url.includes('api.groq.com')) return new Response('unavailable', { status: 503 });
      return Response.json({
        candidates: [{ content: { parts: [{ text: '{"ok":true}' }] } }]
      });
    };

    const result = await providers.generateJsonWithFallback([{ role: 'user', content: 'test' }]);
    assert.equal(result.provider, 'gemini');
    assert.equal(result.content, '{"ok":true}');
    assert.equal(calls.length, 2);
  });

  it('makes no network request unless a provider free tier is explicitly confirmed', async () => {
    clearProviders();
    process.env.GROQ_API_KEY = 'test-groq-key';
    let called = false;
    globalThis.fetch = async () => {
      called = true;
      return Response.json({});
    };

    await assert.rejects(
      providers.generateJsonWithFallback([{ role: 'user', content: 'test' }]),
      /No AI provider is enabled/
    );
    assert.equal(called, false);
  });

  it('blocks OpenRouter models without the free-model suffix', () => {
    clearProviders();
    process.env.OPENROUTER_API_KEY = 'test-openrouter-key';
    process.env.OPENROUTER_FREE_TIER_CONFIRMED = 'true';
    process.env.OPENROUTER_MODEL = 'vendor/model:paid';

    const [status] = providers.getAIProviderStatus().filter(provider => provider.name === 'openrouter');
    assert.equal(status.configured, false);
    assert.equal(status.status, 'paid-model-blocked');
  });
});
