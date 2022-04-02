import Sprite from './Sprite';

/**
 * Base class for anything that has a sprite, (i.e. {@link Tile}, {@link Entity}
 */
interface SpriteContainer {
  getSprite: () => Sprite | null
}

export default SpriteContainer;
