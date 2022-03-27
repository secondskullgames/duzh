import Offsets from '../../geometry/Offsets';
import Image from '../images/Image';
import Sprite from './Sprite';

class StaticSprite extends Sprite {
  private readonly image: Image;

  constructor(image: Image, offsets: Offsets) {
    super(offsets);
    this.image = image;
  }

  /**
   * @override {@link Sprite#getImage}
   */
  getImage = () => Promise.resolve(this.image);
}

export default StaticSprite;
