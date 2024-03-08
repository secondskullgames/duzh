import Sprite from './Sprite';
import Offsets from '@lib/geometry/Offsets';
import { checkNotNull } from '@lib/utils/preconditions';
import { Image } from '@lib/graphics/images/Image';

type Props = Readonly<{
  offsets: Offsets;
  imageMap: Record<string, Image>;
}>;

export default abstract class DynamicSprite<T> implements Sprite {
  private target: T | null;
  private readonly imageMap: Record<string, Image>;
  private readonly offsets: Offsets;

  protected constructor({ offsets, imageMap }: Props) {
    this.offsets = offsets;
    this.target = null;
    this.imageMap = imageMap;
  }

  /**
   * @override {@link Sprite#getImage}
   */
  getImage = (): Image | null => {
    const target = checkNotNull(this.target);
    const frameKey = this.getFrameKey(target);
    const image = this.imageMap[frameKey];
    if (!image) {
      console.debug(`No image found for key: ${frameKey}`);
    }
    return image ?? null;
  };

  /**
   * @override {@link Sprite#getOffsets}
   */
  getOffsets = (): Offsets => this.offsets;

  bind = (target: T) => {
    this.target = target;
  };

  protected abstract getFrameKey: (target: T) => string;
}
