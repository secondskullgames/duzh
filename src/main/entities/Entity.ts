import Coordinates from '../geometry/Coordinates';
import Sprite from '../graphics/sprites/Sprite';
import { EntityType } from './EntityType';
import { GlobalContext } from '../core/GlobalContext';


/**
 * An Entity is basically anything that goes on the game grid.
 * It's typically renderable and must occupy a grid tile.
 */
export default interface Entity {
  getCoordinates: () => Coordinates;
  setCoordinates: (coordinates: Coordinates) => void;
  getSprite: () => Sprite | null;
  update: (context: GlobalContext) => Promise<void>;
  /**
   * Only one blocking entity can occupy a particular tile
   */
  isBlocking: () => boolean;
  getType: () => EntityType;
}
