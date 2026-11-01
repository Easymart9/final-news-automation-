export type AIProviderName = 'groq' | 'gemini' | 'mistral' | 'openrouter' | 'sambanova';

interface ProviderConfig {
  name: AIProviderName;
  key: string;
  model: string;
  freeTierConfirmed: boolean;
}

interface ChatMessage {
  role: 'system' | 'user';
  content: string;
}

interface ProviderResult {
  content: string;
  provider: AIProviderName;
  model: string;
}

const PROVIDERS: Array<{
  name: AIProviderName;
  keyVariable: string;
  modelVariable: string;
  freeTierVariable: string;
  defaultModel: string;
  endpoint: string;
}> = [
  {
    name: 'groq',
    keyVariable: 'GROQ_API_KEY',
    modelVariable: 'GROQ_MODEL',
    freeTierVariable: 'GROQ_FREE_TIER_CONFIRMED',
    defaultModel: 'llama-3.3-70b-versatile',
    endpoint: 'https://api.groq.com/openai/v1/chat/completions'
  },
  {
    name: 'gemini',
    keyVariable: 'GEMINI_API_KEY',
    modelVariable: 'GEMINI_MODEL',
    freeTierVariable: 'GEMINI_FREE_TIER_CONFIRMED',
    defaultModel: 'gemini-2.5-flash',
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/models'
  },
  {
    name: 'mistral',
    keyVariable: 'MISTRAL_API_KEY',
    modelVariable: 'MISTRAL_MODEL',
    freeTierVariable: 'MISTRAL_FREE_TIER_CONFIRMED',
    defaultModel: 'ministral-3b-latest',
    endpoint: 'https://api.mistral.ai/v1/chat/completions'
  },
  {
    name: 'openrouter',
    keyVariable: 'OPENROUTER_API_KEY',
    modelVariable: 'OPENROUTER_MODEL',
    freeTierVariable: 'OPENROUTER_FREE_TIER_CONFIRMED',
    defaultModel: 'meta-llama/llama-3.3-70b-instruct:free',
    endpoint: 'https://openrouter.ai/api/v1/chat/completions'
  },
  {
    name: 'sambanova',
    keyVariable: 'SAMBANOVA_API_KEY',
    modelVariable: 'SAMBANOVA_MODEL',
    freeTierVariable: 'SAMBANOVA_FREE_TIER_CONFIRMED',
    defaultModel: 'Meta-Llama-3.3-70B-Instruct',
    endpoint: 'https://api.sambanova.ai/v1/chat/completions'
  }
];

function getProviderConfig(
  definition: (typeof PROVIDERS)[number]
): ProviderConfig | undefined {
  const key = process.env[definition.keyVariable]?.trim();
  if (!key || process.env[definition.freeTierVariable] !== 'true') return undefined;

  const model = process.env[definition.modelVariable]?.trim() || definition.defaultModel;
  if (definition.name === 'openrouter' && !model.endsWith(':free')) return undefined;

  return {
    name: definition.name,
    key,
    model,
    freeTierConfirmed: true
  };
}

export function getAIProviderStatus() {
  return PROVIDERS.map(definition => {
    const config = getProviderConfig(definition);
    const hasKey = Boolean(process.env[definition.keyVariable]?.trim());
    const freeTierConfirmed = process.env[definition.freeTierVariable] === 'true';
    const model = process.env[definition.modelVariable]?.trim() || definition.defaultModel;
    const modelIsFree = definition.name !== 'openrouter' || model.endsWith(':free');

    return {
      name: definition.name,
      configured: Boolean(config),
      status: config ? 'ready' : !hasKey ? 'missing-key' : !freeTierConfirmed ? 'free-tier-not-confirmed' : !modelIsFree ? 'paid-model-blocked' : 'unavailable',
      model: config ? config.model : undefined
    };
  });
}

function orderedProviders(): Array<(typeof PROVIDERS)[number]> {
  const order = (process.env.AI_PROVIDER_ORDER || 'groq,gemini,mistral,openrouter,sambanova')
    .split(',')
    .map(name => name.trim().toLowerCase())
    .filter((name): name is AIProviderName =>
      PROVIDERS.some(provider => provider.name === name)
    );
  const uniqueOrder = [...new Set(order)];
  return [
    ...uniqueOrder.map(name => PROVIDERS.find(provider => provider.name === name)!),
    ...PROVIDERS.filter(provider => !uniqueOrder.includes(provider.name))
  ];
}

async function requestProvider(
  config: ProviderConfig,
  endpoint: string,
  messages: ChatMessage[],
  maxTokens: number
): Promise<string> {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.key}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://worldbulletin.world',
      'X-Title': 'World Bulletin'
    },
    body: JSON.stringify({
      model: config.model,
      messages,
      temperature: 0.1,
      max_tokens: maxTokens,
      response_format: { type: 'json_object' }
    }),
    signal: AbortSignal.timeout(30_000)
  });

  if (!response.ok) {
    throw new Error(`Provider returned HTTP ${response.status}`);
  }
  const payload = await response.json() as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = payload.choices?.[0]?.message?.content;
  if (!content?.trim()) throw new Error('Provider returned an empty response');
  return content;
}

async function requestGemini(
  config: ProviderConfig,
  endpoint: string,
  messages: ChatMessage[],
  maxTokens: number
): Promise<string> {
  const response = await fetch(`${endpoint}/${encodeURIComponent(config.model)}:generateContent`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': config.key
    },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: messages.find(message => message.role === 'system')?.content || '' }]
      },
      contents: messages
        .filter(message => message.role === 'user')
        .map(message => ({ role: 'user', parts: [{ text: message.content }] })),
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: maxTokens,
        responseMimeType: 'application/json'
      }
    }),
    signal: AbortSignal.timeout(30_000)
  });

  if (!response.ok) {
    throw new Error(`Provider returned HTTP ${response.status}`);
  }
  const payload = await response.json() as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const content = payload.candidates?.[0]?.content?.parts
    ?.map(part => part.text || '')
    .join('');
  if (!content?.trim()) throw new Error('Provider returned an empty response');
  return content;
}

export async function generateJsonWithFallback(
  messages: ChatMessage[],
  maxTokens = 4096
): Promise<ProviderResult> {
  const failures: string[] = [];

  for (const definition of orderedProviders()) {
    const config = getProviderConfig(definition);
    if (!config) continue;

    try {
      const content = definition.name === 'gemini'
        ? await requestGemini(config, definition.endpoint, messages, maxTokens)
        : await requestProvider(config, definition.endpoint, messages, maxTokens);
      return { content, provider: config.name, model: config.model };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown provider failure';
      failures.push(`${config.name}: ${message}`);
      console.warn(`AI provider ${config.name} failed; trying the next configured free provider.`);
    }
  }

  if (failures.length === 0) {
    throw new Error('No AI provider is enabled. Configure a provider key and confirm its free-tier access.');
  }
  throw new Error(`All configured free AI providers failed: ${failures.join('; ')}`);
}
