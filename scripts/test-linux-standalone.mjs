import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

if (process.platform !== 'linux') {
  throw new Error(`Linux standalone verification must run on Linux, not ${process.platform}.`);
}
if (process.arch !== 'x64') {
  throw new Error(`Linux Sharp verification requires x64, not ${process.arch}.`);
}

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const standaloneDirectory = path.join(root, '.next', 'standalone');
const standaloneRequire = createRequire(path.join(standaloneDirectory, 'server.js'));
const sharp = standaloneRequire('sharp');

function findPackageRoot(resolvedFile, expectedName) {
  let directory = path.dirname(resolvedFile);
  while (true) {
    const packageJsonPath = path.join(directory, 'package.json');
    if (existsSync(packageJsonPath)) {
      const metadata = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
      if (metadata.name === expectedName) return { root: directory, metadata };
    }

    const parent = path.dirname(directory);
    if (parent === directory) {
      throw new Error(`Could not find ${expectedName} package root for ${resolvedFile}`);
    }
    directory = parent;
  }
}

const sharpPackageName = `@img/sharp-${process.platform}-${process.arch}`;
const sharpEntry = standaloneRequire.resolve(`${sharpPackageName}/sharp.node`);
const sharpPackage = findPackageRoot(sharpEntry, sharpPackageName);
assert.ok(sharpPackage.metadata.os?.includes('linux'), 'Sharp native package is not marked for Linux.');
assert.ok(sharpPackage.metadata.cpu?.includes('x64'), 'Sharp native package is not marked for x64.');

const sharpEntrySource = readFileSync(sharpEntry, 'utf8');
const nativeBinarySpecifier = sharpEntrySource.match(/require\(['"]([^'"]+\.node)['"]\)/)?.[1];
assert.ok(nativeBinarySpecifier, `Could not identify the native Sharp binary in ${sharpEntry}`);
const sharpNativeBinary = createRequire(sharpEntry).resolve(nativeBinarySpecifier);
assert.ok(existsSync(sharpNativeBinary), `Missing Sharp native binary: ${sharpNativeBinary}`);

const libvipsPackageName = `@img/sharp-libvips-${process.platform}-${process.arch}`;
const libvipsBinary = standaloneRequire.resolve(`${libvipsPackageName}/binary`);
const libvipsPackage = findPackageRoot(libvipsBinary, libvipsPackageName);
assert.ok(libvipsPackage.metadata.os?.includes('linux'), 'libvips package is not marked for Linux.');
assert.ok(libvipsPackage.metadata.cpu?.includes('x64'), 'libvips package is not marked for x64.');
assert.ok(libvipsPackage.metadata.libc?.includes('glibc'), 'libvips package is not marked for glibc.');
assert.ok(existsSync(libvipsBinary), `Missing libvips binary: ${libvipsBinary}`);

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
