import { comparing } from '../../utils/arrays';
import Color from '../Color';
import PaletteSwaps from '../PaletteSwaps';
import { Image } from './Image';
import { ImageEffect } from './ImageEffect';

type CacheKey = Readonly<{
  filename: string,
  transparentColor?: Color | null,
  paletteSwaps?: PaletteSwaps,
  effects?: ImageEffect[]
}>;

interface ImageCache {
  get: ({ filename, transparentColor, paletteSwaps }: CacheKey) => Image | null | undefined,
  put: ({ filename, transparentColor, paletteSwaps }: CacheKey, image: Image | null) => void
}

class Impl implements ImageCache {
  private readonly map: Record<string, Image | null>;
  constructor() {
    this.map = {};
  }

  get = (key: CacheKey): Image | null => {
    return this.map[this._stringify(key)] ?? null;
  };

  put = (key: CacheKey, image: Image | null) => {
    this.map[this._stringify(key)] = image;
  };

  private _stringify = ({ filename, transparentColor, paletteSwaps, effects }: CacheKey): string => {
    const stringifiedPaletteSwaps = paletteSwaps?.entries()
      .sort(comparing(([src, dest]) => src.rgb.r*256*256 + src.rgb.g*256 + src.rgb.b))
      .map(([src, dest]) => `${src.hex}:${dest.hex}`)
      .join(',')
      ?? 'null';
    const effectNames = effects?.map(effect => effect.name).join(',') ?? 'null';
    return `${filename}_${transparentColor?.hex ?? 'null'}_${stringifiedPaletteSwaps}_${effectNames}`;
  };
}


namespace ImageCache {
  export const create = (): ImageCache => new Impl();
}

export default ImageCache;
