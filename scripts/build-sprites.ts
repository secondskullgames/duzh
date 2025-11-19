import { glob } from 'glob';
import appRootPath from 'app-root-path';
import sharp, { OverlayOptions } from 'sharp';
import { z } from 'zod';
import { mkdirSync, writeFileSync, rmSync } from 'fs';

const pngDir = appRootPath.resolve('png');
const outDir = appRootPath.resolve('build/sprites');

type ImageDetails = Readonly<{
  relativePath: string,
  absolutePath: string,
  buffer: Buffer<ArrayBufferLike>,
  metadata: sharp.Metadata
}>;

const imagePaths = await glob.glob('**/*.png', {
  cwd: pngDir
});

// OK, loading 1000+ images into memory isn't ideal, but this is a first draft
const images: ImageDetails[] = await Promise.all(imagePaths.map(async relativePath => {
  const absolutePath = `${pngDir}/${relativePath}`;
  const sharpImage = sharp(absolutePath);
  const metadata = await sharpImage.metadata();
  const buffer = (await sharpImage.toBuffer({ resolveWithObject: true })).data;
  return {
    relativePath,
    absolutePath,
    buffer,
    metadata
  };
}));

let totalWidth = 0;
let maxHeight = 0;
for (const image of Object.values(images)) {
  const { width, height } = image.metadata;
  totalWidth += width;
  if (height > maxHeight) maxHeight = height;
}

const sprite = sharp({
  create: {
    width: totalWidth,
    height: maxHeight,
    channels: 4, // RGBA
    background: '#000000'
  }
});

const SpriteMetadataSchema = z.object({
  left: z.number(),
  top: z.number(),
  width: z.number(),
  height: z.number()
});
type SpriteMetadata = z.infer<typeof SpriteMetadataSchema>;

const overlayOptionsList: OverlayOptions[] = [];
const metadata: Record<string, SpriteMetadata> = {};

let left = 0;
const top = 0;
for (const [filename, image] of Object.entries(images)) {
  const { buffer, metadata: { width, height } } = image;
  overlayOptionsList.push({ input: buffer });
  metadata[filename] = { left, top, width, height };
}
sprite.composite(overlayOptionsList);

rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });
writeFileSync(`${outDir}/sprite.json`, JSON.stringify(metadata, null, 2));
await sprite.toFile(`${outDir}/sprite.png`);