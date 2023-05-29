import Color from '../Color';
import PaletteSwaps from '../PaletteSwaps';
import { Image } from './Image';
import ImageCache from './ImageCache';
import { ImageEffect } from './ImageEffect';
import ImageLoader from './ImageLoader';
import { applyTransparentColor, replaceColors } from './ImageUtils';

type Props = Readonly<{
  filename?: string,
  filenames?: string[]
  transparentColor?: Color | null,
  paletteSwaps?: PaletteSwaps,
  effects?: ImageEffect[]
}>;

const CACHE: ImageCache = ImageCache.create();
const rawCache: Record<string, ImageData | null> = {};

export default class ImageFactory {
  private readonly imageLoader = new ImageLoader();

  getImage = async (props: Props): Promise<Image> => {
    let filenames: string[];
    if (props.filenames) {
      filenames = props.filenames;
    } else if (props.filename) {
      filenames = [props.filename];
    } else {
      throw new Error('No filenames were specified!');
    }
    const { transparentColor, paletteSwaps, effects } = props;

    for (const filename of filenames) {
      const cacheKey = { filename, paletteSwaps, transparentColor, effects };
      const cached: Image | null | undefined = CACHE.get(cacheKey);
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
        for (const effect of (effects ?? [])) {
          imageData = effect.apply(imageData);
        }
        const image = await Image.create({ imageData, filename });
        CACHE.put(cacheKey, image);
        return image;
      }
    }

    throw new Error(`Failed to load images: ${JSON.stringify(filenames)}`);
  };
}