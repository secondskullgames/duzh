import Offsets from '../../geometry/Offsets';
import { Image } from '../images/Image';

/**
 * Note: It's expected that a separate Sprite instance will be created
 * per entity, and frame caching will be handled... somewhere else
 */
abstract class Sprite {
  dx: number;
  dy: number;

  protected constructor({ dx, dy }: Offsets) {
    this.dx = dx;
    this.dy = dy;
  }

  abstract getImage(): Image | null;
}

export default Sprite;
