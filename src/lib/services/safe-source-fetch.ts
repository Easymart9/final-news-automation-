import { lookup } from 'node:dns/promises';
import { request as httpsRequest } from 'node:https';
import { isIP } from 'node:net';

const TRUSTED_SOURCE_DOMAINS = [
  'techcrunch.com',
  'venturebeat.com',
  'theverge.com',
  'wired.com',
  'arxiv.org',
  'bbci.co.uk',
  'bbc.co.uk',
  'bbc.com',
  'thehindu.com',
  'assamtribune.com',
  'eastmojo.com',
  'mygov.in'
];
const MAX_SOURCE_BYTES = 2_000_000;

function parseIpv6Groups(address: string): number[] | undefined {
  const sections = address.toLowerCase().split('::');
  if (sections.length > 2) return undefined;
  const leading = sections[0] ? sections[0].split(':') : [];
  const trailing = sections.length === 2 && sections[1] ? sections[1].split(':') : [];
  const missingGroups = 8 - leading.length - trailing.length;
  if ((sections.length === 1 && missingGroups !== 0) ||
      (sections.length === 2 && missingGroups < 1)) return undefined;
  const groups = [
    ...leading,
    ...Array(missingGroups).fill('0'),
    ...trailing
  ];
  if (groups.some(group => !/^[a-f0-9]{1,4}$/.test(group))) return undefined;
  return groups.map(group => Number.parseInt(group, 16));
}

export function isPublicAddress(address: string): boolean {
  const version = isIP(address);
  if (version === 4) {
    const [first, second, third] = address.split('.').map(Number);
    return !(
      first === 0 || first === 10 || first === 127 || first >= 224 ||
      (first === 100 && second >= 64 && second <= 127) ||
      (first === 169 && second === 254) ||
      (first === 172 && second >= 16 && second <= 31) ||
      (first === 192 && (second === 168 || second === 0 || second === 88 && third === 99)) ||
      (first === 198 && (second === 18 || second === 19 || second === 51 && third === 100)) ||
      (first === 203 && second === 0 && third === 113)
    );
  }
  if (version !== 6) return false;
  const groups = parseIpv6Groups(address);
  if (!groups) return false;
  const [first, second] = groups;
  return first >= 0x2000 && first <= 0x3fff &&
    !(first === 0x2001 && second <= 0x01ff) &&
    !(first === 0x2001 && second === 0x0db8) &&
    first !== 0x2002 &&
    !(first === 0x3fff && second <= 0x0fff);
}

async function validateSourceUrl(value: string): Promise<{ url: URL; addresses: string[] }> {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error('News source URL is invalid.');
  }

  const hostname = url.hostname.toLowerCase().replace(/\.$/, '');
  const trusted = TRUSTED_SOURCE_DOMAINS.some(domain =>
    hostname === domain || hostname.endsWith(`.${domain}`)
  );
  if (url.protocol !== 'https:' || !trusted || url.username || url.password ||
      (url.port && url.port !== '443') || isIP(hostname)) {
    throw new Error('News source URL is not an approved public HTTPS source.');
  }

  const addresses = await lookup(hostname, { all: true, verbatim: true });
  if (addresses.length === 0 || addresses.some(result => !isPublicAddress(result.address))) {
    throw new Error('News source hostname did not resolve exclusively to public IP addresses.');
  }
  return { url, addresses: addresses.map(result => result.address) };
}

async function fetchPinnedSource(
  url: URL,
  address: string,
  init: RequestInit
): Promise<Response> {
  const method = (init.method || 'GET').toUpperCase();
  if ((method !== 'GET' && method !== 'HEAD') || init.body) {
    throw new Error('Only bodyless GET and HEAD requests are supported for news sources.');
  }

  const headers = new Headers(init.headers);
  if (!headers.has('accept-encoding')) headers.set('accept-encoding', 'identity');

  return new Promise((resolve, reject) => {
    const request = httpsRequest({
      hostname: url.hostname,
      port: url.port || 443,
      path: `${url.pathname}${url.search}`,
      method,
      headers: Object.fromEntries(headers.entries()),
      servername: url.hostname,
      lookup: (_hostname, _options, callback) => callback(null, address, isIP(address)),
      signal: init.signal || AbortSignal.timeout(10_000)
    }, response => {
      const responseHeaders = new Headers();
      for (const [name, value] of Object.entries(response.headers)) {
        if (Array.isArray(value)) {
          for (const item of value) responseHeaders.append(name, item);
        } else if (value !== undefined) {
          responseHeaders.append(name, value);
        }
      }

      const declaredLength = Number(responseHeaders.get('content-length') || 0);
      if (declaredLength > MAX_SOURCE_BYTES) {
        response.destroy();
        reject(new Error('News source response exceeded the size limit.'));
        return;
      }

      const chunks: Buffer[] = [];
      let received = 0;
      response.on('data', (chunk: Buffer | string) => {
        const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
        received += buffer.byteLength;
        if (received > MAX_SOURCE_BYTES) {
          response.destroy();
          reject(new Error('News source response exceeded the size limit.'));
          return;
        }
        chunks.push(buffer);
      });
      response.once('aborted', () => reject(new Error('News source response was interrupted.')));
      response.once('error', reject);
      response.once('end', () => {
        const status = response.statusCode || 502;
        const body = method === 'HEAD' || status === 204 || status === 304
          ? null
          : Buffer.concat(chunks);
        resolve(new Response(body, {
          status,
          headers: responseHeaders
        }));
      });
    });

    request.once('error', reject);
    request.end();
  });
}

export async function fetchNewsSource(
  input: string,
  init: RequestInit = {},
  maxRedirects = 3
): Promise<Response> {
  let validated = await validateSourceUrl(input);
  for (let redirectCount = 0; redirectCount <= maxRedirects; redirectCount++) {
    const response = await fetchPinnedSource(validated.url, validated.addresses[0], init);
    if (![301, 302, 303, 307, 308].includes(response.status)) return response;
    const location = response.headers.get('location');
    if (!location || redirectCount === maxRedirects) {
      throw new Error('News source returned an invalid or excessive redirect.');
    }
    validated = await validateSourceUrl(new URL(location, validated.url).toString());
  }
  throw new Error('News source returned an excessive redirect.');
}

export async function readLimitedResponse(
  response: Response,
  maximumBytes = MAX_SOURCE_BYTES
): Promise<string> {
  const declaredLength = Number(response.headers.get('content-length') || 0);
  if (declaredLength > maximumBytes) {
    await response.body?.cancel();
    throw new Error('News source response exceeded the size limit.');
  }
  if (!response.body) return '';

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let received = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    received += value.byteLength;
    if (received > maximumBytes) {
      await reader.cancel();
      throw new Error('News source response exceeded the size limit.');
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(received);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(bytes);
}
