import { EntityType } from './EntityType';
import Sprite from '../graphics/sprites/Sprite';
import MapInstance from '../maps/MapInstance';
import { Coordinates } from '@lib/geometry/Coordinates';
import { GameState } from '@main/core/GameState';
import { Session } from '@main/core/Session';

/**
 * An Entity is basically anything that goes on the game grid.
 * It's typically renderable and must occupy a grid tile.
 */
export default interface Entity {
  /** TODO not really needed for all entity types */
  getName: () => string;
  getCoordinates: () => Coordinates;
  setCoordinates: (coordinates: Coordinates) => void;
  getMap: () => MapInstance;
  setMap: (map: MapInstance) => void;
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
