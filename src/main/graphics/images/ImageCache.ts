import { Image } from './Image';
import { ImageEffect } from './ImageEffect';
import { comparing } from '../../utils/arrays';
import Color from '../Color';
import PaletteSwaps from '../PaletteSwaps';

type CacheKey = Readonly<{
  filename: string;
  transparentColor?: Color | null;
  paletteSwaps?: PaletteSwaps;
  effects?: ImageEffect[];
}>;

interface ImageCache {
  get: (key: CacheKey) => Image | null | undefined;
  put: (key: CacheKey, image: Image | null) => void;
}

const _stringify = (key: CacheKey): string => {
  const { filename, transparentColor, paletteSwaps, effects } = key;
  const stringifiedPaletteSwaps =
    paletteSwaps
      ?.entries()
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .sort(
        comparing(([src, dest]) => src.rgb.r * 256 * 256 + src.rgb.g * 256 + src.rgb.b)
      )
      .map(([src, dest]) => `${src.hex}:${dest.hex}`)
      .join(',') ?? 'null';
  const effectNames = effects?.map(effect => effect.name).join(',') ?? 'null';
  return `${filename}_${
    transparentColor?.hex ?? 'null'
  }_${stringifiedPaletteSwaps}_${effectNames}`;
};

class Impl implements ImageCache {
  private readonly map: Record<string, Image | null>;
  constructor() {
    this.map = {};
  }

  get = (key: CacheKey): Image | null => {
    return this.map[_stringify(key)] ?? null;
  };

  put = (key: CacheKey, image: Image | null) => {
    this.map[_stringify(key)] = image;
  };
}

namespace ImageCache {
  export const create = (): ImageCache => new Impl();
}

export default ImageCache;
