import Offsets from '../../geometry/Offsets';
import { Image } from '../images/Image';

/**
 * Note: It's expected that a separate Sprite instance will be created
 * per entity, and frame caching will be handled... somewhere else
 */
export default interface Sprite {
  getImage(): Image | null;
  getOffsets(): Offsets;
}