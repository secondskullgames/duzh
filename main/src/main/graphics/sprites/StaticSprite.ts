import Sprite from './Sprite';
import { Offsets } from '@lib/geometry/Offsets';
import { Image } from '@lib/graphics/images/Image';

export default class StaticSprite implements Sprite {
  private readonly image: Image;
  private readonly offsets: Offsets;

  constructor(image: Image, offsets: Offsets) {
    this.image = image;
    this.offsets = offsets;
  }

  /**
   * @override {@link Sprite#getImage}
   */
  getImage = () => this.image;

  /**
   * @override {@link Sprite#getOffsets}
   */
  getOffsets = () => this.offsets;
}
