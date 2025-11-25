import Sprite from './Sprite';
import { Offsets } from '@duzh/geometry';
import { checkNotNull } from '@duzh/utils/preconditions';
import { Image } from '@lib/graphics/images/Image';

type Props = Readonly<{
  spriteName: string;
  offsets: Offsets;
  imageMap: Record<string, Image>;
}>;

export default abstract class DynamicSprite<T> implements Sprite {
  private readonly spriteName: string;
  private target: T | null;
  private readonly imageMap: Record<string, Image>;
  private readonly offsets: Offsets;

  protected constructor({ spriteName, offsets, imageMap }: Props) {
    this.spriteName = spriteName;
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
    return image ?? null;
  };

  /**
   * @override {@link Sprite#getOffsets}
   */
  getOffsets = (): Offsets => this.offsets;

  /**
   * This is expected to be called in the target's constructor
   */
  bind = (target: T) => {
    this.target = target;
  };

  protected abstract getFrameKey: (target: T) => string;
}
