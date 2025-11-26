import { glob } from 'glob';
import { mkdirSync, writeFileSync } from 'node:fs';
import { ImageBundle } from '@duzh/models';
import sharp from 'sharp';

export const buildImageBundle = async (): Promise<ImageBundle> => {
  const filenames = await glob('**/*.png', { cwd: './png' });
  return Object.fromEntries(
    await Promise.all(
      filenames.map(async filename => [filename, await loadImageDataUrl(filename)])
    )
  );
};

const loadImageDataUrl = async (filename: string): Promise<string> => {
  const result = await sharp(`./png/${filename}`)
    .png({ compressionLevel: 9, palette: true })
    .removeAlpha()
    .toBuffer({ resolveWithObject: true });
  const buffer = result.data;
  const encoded = buffer.toString('base64');
  return `data:image/png;base64,${encoded}`;
};

const imageBundle = await buildImageBundle();
const outFile = 'build/images.json';
mkdirSync('build', { recursive: true });
writeFileSync(outFile, JSON.stringify(imageBundle));
console.log(`Wrote ${Object.keys(imageBundle).length} images to ${outFile}`);
