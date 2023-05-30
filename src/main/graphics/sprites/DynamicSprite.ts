import Offsets from '../../geometry/Offsets';
import Animatable from '../animations/Animatable';
import { Image } from '../images/Image';
import PaletteSwaps from '../PaletteSwaps';
import { checkNotNull } from '../../utils/preconditions';
import Sprite from './Sprite';

type Props = Readonly<{
  offsets: Offsets,
  paletteSwaps?: PaletteSwaps,
  imageMap: Record<string, Image>
}>;

export default class DynamicSprite<T extends Animatable> extends Sprite {
  target: T | null;
  private readonly paletteSwaps: PaletteSwaps;
  private readonly imageMap: Record<string, Image>;

  constructor({ offsets, paletteSwaps, imageMap }: Props) {
    super(offsets);
    this.target = null;
    this.paletteSwaps = paletteSwaps ?? PaletteSwaps.empty();
    this.imageMap = imageMap;
  }

  /**
   * @override {@link Sprite#getImage}
   */
  getImage = (): Image | null => {
    const target = checkNotNull(this.target);
    const frameKey = target.getAnimationKey();
    return this.imageMap[frameKey] ?? null;
  };
}
