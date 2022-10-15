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
  transparentColor?: Color | null,
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
    promises.push(new Promise(async (resolve) => {
      let imageData: ImageData | null;
      if (rawCache[filename]) {
        imageData = rawCache[filename];
      } else {
        imageData = await ImageLoader.loadImage(filename);
        rawCache[filename] = imageData;
      }
      if (imageData) {
        if (transparentColor) {
          imageData = applyTransparentColor(imageData, transparentColor);
        }
        if (paletteSwaps) {
          imageData = replaceColors(imageData, paletteSwaps);
        }
        for (const effect of (effects || [])) {
          imageData = effect.apply(imageData);
        }
        const image = await Image.create({ imageData, filename });
        CACHE.put(cacheKey, image);
        resolve(image);
      }
      resolve(null);
    }));
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
