import Coordinates from '../geometry/Coordinates';
import Sprite from '../graphics/sprites/Sprite';

/**
 * An Entity is basically anything that goes on the game grid.
 * It's typically renderable and must occupy a grid tile.
 */
interface Entity {
  getCoordinates: () => Coordinates;
  getSprite: () => Sprite | null;
  update: () => Promise<void>;
  /**
   * Only one blocking entity can occupy a particular tile
   */
  isBlocking: () => boolean;
  getType: () => EntityType;
}

export default Entity;
