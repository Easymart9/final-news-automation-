import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

if (process.platform !== 'linux') {
  throw new Error(`Linux standalone verification must run on Linux, not ${process.platform}.`);
}

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const standaloneDirectory = path.join(root, '.next', 'standalone');
const standaloneRequire = createRequire(path.join(standaloneDirectory, 'server.js'));
const sharp = standaloneRequire('sharp');
const platformPackage = `@img/sharp-${process.platform}-${process.arch}`;

assert.ok(standaloneRequire.resolve(platformPackage), `Missing standalone native package ${platformPackage}`);

const svg = Buffer.from(
  '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="16"><rect width="32" height="16" fill="#2277cc"/></svg>'
);
const optimized = await sharp(svg).resize({ width: 64 }).png().toBuffer({ resolveWithObject: true });

assert.equal(optimized.info.format, 'png');
assert.equal(optimized.info.width, 64);
assert.equal(optimized.info.height, 32);
assert.ok(optimized.data.byteLength > 0);
assert.ok(sharp.versions.vips, 'Sharp did not load its native libvips runtime.');

console.log(`Linux standalone Sharp image optimization passed (${process.arch}, libvips ${sharp.versions.vips}).`);
