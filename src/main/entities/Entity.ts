import Coordinates from '../geometry/Coordinates';
import Sprite from '../graphics/sprites/Sprite';
import { EntityType } from './EntityType';
import Game from '../core/Game';
import ImageFactory from '../graphics/images/ImageFactory';
import Ticker from '../core/Ticker';
import MapInstance from '../maps/MapInstance';

export type UpdateContext = Readonly<{
  game: Game,
  map: MapInstance,
  imageFactory: ImageFactory,
  ticker: Ticker
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
