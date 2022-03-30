import Color from '../Color';
import PaletteSwaps from '../PaletteSwaps';
import Image from './Image';
import ImageCache from './ImageCache';
import ImageEffect from './ImageEffect';
import ImageLoader from './ImageLoader';
import { applyTransparentColor, replaceColors } from './ImageUtils';

type Props = {
  filename?: string,
  filenames?: string[]
  transparentColor?: Color,
  paletteSwaps?: PaletteSwaps,
  effects?: ImageEffect[]
};

const CACHE: ImageCache = ImageCache.create();
const rawCache: Record<string, ImageData | null> = {};

const getImage = async ({ filename, filenames: _filenames, transparentColor, paletteSwaps, effects }: Props): Promise<Image> => {
  let filenames: string[];
  if (_filenames) {
    filenames = _filenames;
  } else if (filename) {
    filenames = [filename];
  } else {
    throw new Error('No filenames were specified!');
  }

  const promises: Promise<Image | null>[] = [];
  for (const filename of filenames) {
    const cacheKey = { filename, paletteSwaps, transparentColor, effects };
    const cached: Image | null | undefined = CACHE.get(cacheKey);
    if (cached) {
      return cached;
    }
    const promise = async () => {
      let imageData: ImageData | null;
      if (rawCache[filename]) {
        imageData = rawCache[filename];
      } else {
        imageData = await ImageLoader.loadImage(filename);
        rawCache[filename] = imageData;
      }
      if (imageData) {
        if (transparentColor) {
          imageData = await applyTransparentColor(imageData, transparentColor);
        }
        if (paletteSwaps) {
          imageData = await replaceColors(imageData, paletteSwaps);
        }
        for (const effect of (effects || [])) {
          imageData = await effect.apply(imageData);
        }
        const image = await Image.create({ imageData, filename });
        CACHE.put(cacheKey, image);
        return image;
      }
      return null;
    };
    promises.push(promise());
  }
  const image: Image | null | undefined = (await Promise.all(promises)).find(image => image);
  if (!image) {
    throw new Error(`Failed to load images: ${JSON.stringify(filenames)}`);
  }
  return image;
};

export default {
  getImage
};
