import { glob } from 'glob';
import { mkdirSync, writeFileSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { ImageBundle } from './ImageBundle.js';

export const buildImageBundle = async (): Promise<ImageBundle> => {
  const filenames = await glob('**/*.png', { cwd: './png' });
  return Object.fromEntries(
    await Promise.all(
      filenames.map(async filename => [filename, await loadImageDataUrl(filename)])
    )
  );
};

const loadImageDataUrl = async (filename: string): Promise<string> => {
  const buffer = await readFile(`./png/${filename}`);
  const encoded = buffer.toString('base64');
  return `data:image/png;base64,${encoded}`;
};

const imageBundle = await buildImageBundle();
const outFile = 'build/images.json';
mkdirSync('build', { recursive: true });
writeFileSync(outFile, JSON.stringify(imageBundle));
