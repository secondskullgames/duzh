import PaletteSwaps from '../../types/PaletteSwaps';
import { Offsets } from '../../types/types';
import Sprite from './Sprite';

type Props<T> = {
  offsets: Offsets,
  paletteSwaps: PaletteSwaps,
  imageMap: Record<string, ImageBitmap>
  keyFunction: (t: T) => string
};

class DynamicSprite<T> extends Sprite {
  target: T | null;
  private readonly paletteSwaps: PaletteSwaps;
  private readonly imageMap: Record<string, ImageBitmap>;
  private readonly keyFunction: (t: T) => string;

  constructor({ offsets, paletteSwaps, imageMap, keyFunction }: Props<T>) {
    super(offsets);
    this.target = null;
    this.paletteSwaps = paletteSwaps;
    this.imageMap = imageMap;
    this.keyFunction = keyFunction;
  }

  /**
   * @override {@link Sprite#getImage}
   */
  getImage = (): ImageBitmap => {
    const frameKey = this.keyFunction(this.target!!);
    return this.imageMap[frameKey];
  };
}

export default DynamicSprite;
