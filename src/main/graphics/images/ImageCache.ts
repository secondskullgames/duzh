import { comparing } from '../../utils/arrays';
import Color from '../Color';
import PaletteSwaps from '../PaletteSwaps';
import Image from './Image';
import ImageEffect from './ImageEffect';

type CacheKey = {
  filename: string,
  transparentColor?: Color,
  paletteSwaps?: PaletteSwaps,
  effects?: ImageEffect[]
};

type ImageCache = {
  get: ({ filename, transparentColor, paletteSwaps }: CacheKey) => Image | null | undefined,
  put: ({ filename, transparentColor, paletteSwaps }: CacheKey, image: Image | null) => void
};

const _hash = ({ filename, transparentColor, paletteSwaps, effects }: CacheKey): string => {
  const stringifiedPaletteSwaps = paletteSwaps?.entries()
    .sort(comparing(([src, dest]) => src.rgb.r*256*256 + src.rgb.g*256 + src.rgb.b))
    .map(([src, dest]) => `${src.hex}:${dest.hex}`)
    .join(',')
    || 'null';
  const effectNames = effects?.map(effect => effect.name).join(',') || 'null';
  return `${filename}_${transparentColor?.hex || 'null'}_${stringifiedPaletteSwaps}_${effectNames}`;
};

const createImageCache = (): ImageCache => {
  const map: Record<string, Image | null> = {};

  return {
    get: ({ filename, transparentColor, paletteSwaps, effects }: CacheKey): Image | null => {
      const key = _hash({ filename, transparentColor, paletteSwaps, effects });
      return map[key];
    },
    put: ({ filename, transparentColor, paletteSwaps, effects }, image: Image | null) => {
      const key = _hash({ filename, transparentColor, paletteSwaps, effects });
      map[key] = image;
    }
  };
};

namespace ImageCache {
  export const create: () => ImageCache = createImageCache;
}

export default ImageCache;
