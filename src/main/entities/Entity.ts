import { EntityType } from './EntityType';
import Coordinates from '../geometry/Coordinates';
import Sprite from '../graphics/sprites/Sprite';
import { GameState } from '../core/GameState';
import MapInstance from '../maps/MapInstance';
import { Session } from '../core/Session';

export type UpdateContext = Readonly<{
  state: GameState;
  map: MapInstance;
  session: Session;
}>;

/**
 * An Entity is basically anything that goes on the game grid.
 * It's typically renderable and must occupy a grid tile.
 */
export default interface Entity {
  getCoordinates: () => Coordinates;
  setCoordinates: (coordinates: Coordinates) => void;
  getSprite: () => Sprite | null;
  update: (context: UpdateContext) => Promise<void>;
  /**
   * Only one blocking entity can occupy a particular tile
   */
  isBlocking: () => boolean;
  getType: () => EntityType;
}
