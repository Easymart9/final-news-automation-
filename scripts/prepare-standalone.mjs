import { cpSync, existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';

const standaloneDirectory = path.resolve('.next/standalone');
const staticDirectory = path.resolve('.next/static');
const publicDirectory = path.resolve('public');

if (!existsSync(standaloneDirectory)) {
  throw new Error('Next.js standalone output was not generated.');
}

for (const [source, destination] of [
  [staticDirectory, path.join(standaloneDirectory, '.next', 'static')],
  [publicDirectory, path.join(standaloneDirectory, 'public')]
]) {
  if (!existsSync(source)) {
    throw new Error(`Required standalone deployment directory is missing: ${source}`);
  }
  mkdirSync(path.dirname(destination), { recursive: true });
  cpSync(source, destination, { recursive: true, force: true });
}
