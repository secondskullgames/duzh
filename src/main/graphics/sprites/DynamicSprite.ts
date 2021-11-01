import PaletteSwaps from '../../types/PaletteSwaps';
import { Offsets } from '../../types/types';
import Sprite from './Sprite';

type Props<T> = {
  offsets: Offsets,
  target: T,
  paletteSwaps: PaletteSwaps,
  imageMap: Record<string, ImageBitmap>
  keyFunction: (t: T) => string
};

class DynamicSprite<T> extends Sprite {
  private readonly target: T;
  private readonly paletteSwaps: PaletteSwaps;
  private readonly imageMap: Record<string, ImageBitmap>;
  private readonly keyFunction: (t: T) => string;

  constructor({ offsets, target, paletteSwaps, imageMap, keyFunction }: Props<T>) {
    super(offsets);
    this.target = target;
    this.paletteSwaps = paletteSwaps;
    this.imageMap = imageMap;
    this.keyFunction = keyFunction;
  }

  /**
   * @override {@link Sprite#getImage}
   */
  getImage = (): ImageBitmap => {
    const frameKey = this.keyFunction(this.target);
    return this.imageMap[frameKey];
  };
}

export default DynamicSprite;
