import Sprite from './Sprite';
import Tile from '../../tiles/Tile';
import Entity from '../../types/Entity';

/**
 * Base class for anything that has a sprite, (i.e. {@link Tile}, {@link Entity}
 */
interface SpriteContainer {
  getSprite: () => Sprite | null
}

export default SpriteContainer;
