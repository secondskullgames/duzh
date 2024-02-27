import { Image } from '../images/Image';
import { Offsets } from '@main/geometry';
import { checkNotNull } from '@main/utils/preconditions';
import { Sprite } from '@main/graphics/sprites/Sprite';

type Props = Readonly<{
  offsets: Offsets;
  imageMap: Record<string, Image>;
}>;

export abstract class DynamicSprite<T> implements Sprite {
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
    const frameKey = this.getAnimationKey(target);
    return this.imageMap[frameKey] ?? null;
  };

  /**
   * @override {@link Sprite#getOffsets}
   */
  getOffsets = (): Offsets => this.offsets;

  bind = (target: T) => {
    this.target = target;
  };

  protected abstract getAnimationKey: (target: T) => string;
}
