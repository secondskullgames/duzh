import Offsets from '../../geometry/Offsets';
import Animatable from '../../types/Animatable';
import PaletteSwaps from '../PaletteSwaps';
import { checkNotNull } from '../../utils/preconditions';
import Sprite from './Sprite';

type Props<T> = {
  offsets: Offsets,
  paletteSwaps?: PaletteSwaps,
  imageMap: Record<string, () => Promise<ImageBitmap>>
};

class DynamicSprite<T extends Animatable> extends Sprite {
  target: T | null;
  private readonly paletteSwaps: PaletteSwaps;
  private readonly imageMap: Record<string, () => Promise<ImageBitmap>>;
  private readonly promises: Partial<Record<string, Promise<ImageBitmap | null>>> = {};

  constructor({ offsets, paletteSwaps, imageMap }: Props<T>) {
    super(offsets);
    this.target = null;
    this.paletteSwaps = paletteSwaps || PaletteSwaps.empty();
    this.imageMap = imageMap;
  }

  /**
   * @override {@link Sprite#getImage}
   */
  getImage = (): Promise<ImageBitmap | null> => {
    const target = checkNotNull(this.target);
    const frameKey = target.getAnimationKey();
    // ugh
    if (this.promises[frameKey]) {
      return this.promises[frameKey] || Promise.resolve(null);
    }

    const supplier = this.imageMap[frameKey];
    const promise: Promise<ImageBitmap | null> = supplier?.() || Promise.resolve(null);
    this.promises[frameKey] = promise;
    return promise;
  };
}

export default DynamicSprite;
