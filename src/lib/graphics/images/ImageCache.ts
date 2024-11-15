import { Image } from './Image';
import { ImageEffect } from './ImageEffect';
import { PaletteSwaps } from '@lib/graphics/PaletteSwaps';
import { comparing } from '@lib/utils/arrays';
import { Color } from '@lib/graphics/Color';

type CacheKey = Readonly<{
  filename: string;
  transparentColor?: Color | null;
  paletteSwaps?: PaletteSwaps;
  effects?: ImageEffect[];
}>;

export class ImageCache {
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

const _stringify = (key: CacheKey): string => {
  const { filename, transparentColor, paletteSwaps, effects } = key;
  const stringifiedPaletteSwaps =
    paletteSwaps
      ?.entries()
      .sort(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        comparing(([src, _]) => src.rgb.r * 256 * 256 + src.rgb.g * 256 + src.rgb.b)
      )
      .map(([src, dest]) => `${src.hex}:${dest.hex}`)
      .join(',') ?? 'null';
  const effectNames = effects?.map(effect => effect.name).join(',') ?? 'null';
  return `${filename}_${
    transparentColor?.hex ?? 'null'
  }_${stringifiedPaletteSwaps}_${effectNames}`;
};
