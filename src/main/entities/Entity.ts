import { EntityType } from './EntityType';
import MapInstance from '../maps/MapInstance';
import { Coordinates } from '@main/geometry';
import { GameState, Session } from '@main/core';
import { Sprite } from '@main/graphics/sprites';

/**
 * An Entity is basically anything that goes on the game grid.
 * It's typically renderable and must occupy a grid tile.
 */
export interface Entity {
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
