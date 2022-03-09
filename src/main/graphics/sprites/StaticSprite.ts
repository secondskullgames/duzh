import Offsets from '../../geometry/Offsets';
import Sprite from './Sprite';

class StaticSprite extends Sprite {
  private readonly image: ImageBitmap;

  constructor(image: ImageBitmap, offsets: Offsets) {
    super(offsets);
    this.image = image;
  }

  /**
   * @override {@link Sprite#getImage}
   */
  getImage = () => this.image;
}

export default StaticSprite;
