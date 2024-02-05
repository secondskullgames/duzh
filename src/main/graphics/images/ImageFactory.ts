import { Image } from './Image';
import { ImageCache } from './ImageCache';
import { ImageEffect } from './ImageEffect';
import ImageLoader from './ImageLoader';
import { applyTransparentColor, replaceColors } from './ImageUtils';
import PaletteSwaps from '../PaletteSwaps';
import Color from '../Color';
import { inject, injectable } from 'inversify';

type Params = Readonly<{
  filename?: string;
  filenames?: string[];
  transparentColor?: Color | null;
  paletteSwaps?: PaletteSwaps;
  effects?: ImageEffect[];
}>;

@injectable()
export default class ImageFactory {
  private readonly rawCache: Record<string, ImageData | null> = {};

  constructor(
    @inject(ImageLoader) private readonly imageLoader: ImageLoader,
    @inject(ImageCache.SYMBOL) private readonly cache: ImageCache
  ) {}

  getImage = async (params: Params): Promise<Image> => {
    const { cache, rawCache } = this;

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

      let imageData: ImageData | null;
      if (rawCache[filename]) {
        imageData = rawCache[filename];
      } else {
        imageData = await this.imageLoader.loadImage(filename);
        rawCache[filename] = imageData;
      }
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
