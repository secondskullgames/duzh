import { Color } from '../Color.js';
import { PaletteSwaps } from '../PaletteSwaps.js';
import { Image } from './Image.js';
import { ImageCache } from './ImageCache.js';
import { ImageEffect } from './ImageEffect.js';
import { ImageLoader } from './ImageLoader.js';
import { applyTransparentColor, replaceColors } from './ImageUtils.js';

type Params = Readonly<{
  filename?: string;
  filenames?: string[];
  transparentColor?: Color | null;
  paletteSwaps?: PaletteSwaps;
  effects?: ImageEffect[];
}>;

export class ImageFactory {
  private readonly cache = new ImageCache();
  constructor(private readonly imageLoader: ImageLoader) {}

  getImage = async (params: Params): Promise<Image> => {
    const { cache } = this;

    let filenames: string[];
    if (params.filenames) {
      filenames = params.filenames;
    } else if (params.filename) {
      filenames = [params.filename];
    } else {
      throw new Error('No filenames were specified!');
    }
    const { transparentColor, paletteSwaps, effects } = params;

    for (const filename of filenames) {
      const cacheKey = { filename, paletteSwaps, transparentColor, effects };
      const cached: Image | null | undefined = cache.get(cacheKey);
      if (cached) {
        return cached;
      }

      let imageData = await this.imageLoader.loadImageDataOptional(filename);
      if (imageData) {
        if (transparentColor) {
          imageData = applyTransparentColor(imageData, transparentColor);
        }
        if (paletteSwaps) {
          imageData = replaceColors(imageData, paletteSwaps);
        }
        for (const effect of effects ?? []) {
          imageData = effect.apply(imageData);
        }
        const image = await Image.create({ imageData, filename });
        cache.put(cacheKey, image);
        return image;
      }
    }

    throw new Error(`Failed to load images: ${JSON.stringify(filenames)}`);
  };
}
