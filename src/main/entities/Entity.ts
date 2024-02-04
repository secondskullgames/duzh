import { EntityType } from './EntityType';
import Coordinates from '../geometry/Coordinates';
import Sprite from '../graphics/sprites/Sprite';
import { GameState } from '../core/GameState';
import { Session } from '../core/Session';

/**
 * An Entity is basically anything that goes on the game grid.
 * It's typically renderable and must occupy a grid tile.
 */
export default interface Entity {
  getCoordinates: () => Coordinates;
  setCoordinates: (coordinates: Coordinates) => void;
  getSprite: () => Sprite | null;
  /**
   * Execute this entity's action for the current turn.
   */
  playTurnAction: (state: GameState, session: Session) => Promise<void>;
  /**
   * Only one blocking entity can occupy a particular tile
   */
  isBlocking: () => boolean;
  getType: () => EntityType;
}
