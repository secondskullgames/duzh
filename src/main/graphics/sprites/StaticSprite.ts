import Sprite from './Sprite';
import { Image } from '../images/Image';
import { Offsets } from '@main/geometry';

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
