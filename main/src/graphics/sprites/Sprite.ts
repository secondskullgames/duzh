import { Offsets } from '@duzh/geometry';
import { Image } from '@duzh/graphics/images';

/**
 * Note: It's expected that a separate Sprite instance will be created
 * per entity, and frame caching will be handled... somewhere else
 */
export default interface Sprite {
  getImage(): Image | null;
  getOffsets(): Offsets;
}
