import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { afterEach, describe, it } from 'node:test';

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
const originalFetch = globalThis.fetch;

function commonsResponse(pages) {
  return { ok: true, json: async () => ({ query: { pages } }) };
}

afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe('automated featured-image assignment', () => {
  it('selects a relevant permissively licensed image not already assigned', async () => {
    const assignedUrl = 'https://thumb.wikimedia.org/wikipedia/commons/thumb/a/1/a.jpg?width=1200';
    const selectedUrl = 'https://thumb.wikimedia.org/wikipedia/commons/thumb/b/2/elephant.jpg?width=1200';
    globalThis.fetch = async (input, init) => {
      if (String(input).includes('commons.wikimedia.org/w/api.php')) {
        return commonsResponse({
            1: { title: 'File:Assam Elephant Sanctuary.jpg', imageinfo: [{ thumburl: assignedUrl, width: 2400, descriptionurl: 'https://commons.wikimedia.org/wiki/File:Assam_Elephant_Sanctuary.jpg', extmetadata: { LicenseShortName: { value: 'CC BY 4.0' }, Artist: { value: 'Photographer One' }, ImageDescription: { value: 'Elephant at Assam sanctuary' } } }] },
            2: { title: 'File:Elephant protection sanctuary.jpg', imageinfo: [{ thumburl: selectedUrl, width: 2400, descriptionurl: 'https://commons.wikimedia.org/wiki/File:Elephant_protection_sanctuary.jpg', extmetadata: { LicenseShortName: { value: 'CC BY-SA 4.0' }, LicenseUrl: { value: 'https://creativecommons.org/licenses/by-sa/4.0/' }, Artist: { value: '<b>Photographer Two</b>' }, ImageDescription: { value: 'Elephant protection at an Indian sanctuary' } } }] }
        });
      }
      assert.equal(init?.method, 'HEAD');
      return { ok: true };
    };

    const result = await fetchFeaturedImage('Wildlife', 'Assam elephant protection sanctuary', [assignedUrl]);

    assert.equal(result.imageUrl, selectedUrl);
    assert.equal(result.needsReview, false);
    assert.equal(result.credit, 'Photographer Two');
    assert.equal(result.license, 'CC BY-SA 4.0');
    assert.equal(result.licenseUrl, 'https://creativecommons.org/licenses/by-sa/4.0/');
    assert.equal(result.sourceUrl, 'https://commons.wikimedia.org/wiki/File:Elephant_protection_sanctuary.jpg');
    assert.match(result.altText, /Elephant protection sanctuary/);
  });

  it('holds a story when only unlicensed or irrelevant results are available', async () => {
    globalThis.fetch = async input => {
      assert.ok(String(input).includes('commons.wikimedia.org/w/api.php'));
      return commonsResponse({
          1: { title: 'File:Unrelated building.jpg', imageinfo: [{ thumburl: 'https://thumb.wikimedia.org/a.jpg', width: 2400, descriptionurl: 'https://commons.wikimedia.org/wiki/File:Unrelated.jpg', extmetadata: { LicenseShortName: { value: 'CC BY 4.0' }, ImageDescription: { value: 'A building' } } }] },
          2: { title: 'File:Assam elephant.jpg', imageinfo: [{ thumburl: 'https://thumb.wikimedia.org/b.jpg', width: 2400, descriptionurl: 'https://commons.wikimedia.org/wiki/File:Assam_elephant.jpg', extmetadata: { LicenseShortName: { value: 'CC BY-NC 4.0' }, LicenseUrl: { value: 'https://creativecommons.org/licenses/by-nc/4.0/' }, ImageDescription: { value: 'An elephant in Assam' } } }] }
      });
    };

    const result = await fetchFeaturedImage('Wildlife', 'Assam elephant protection sanctuary');

    assert.equal(result.needsReview, true);
    assert.equal(result.imageUrl, '');
  });
});