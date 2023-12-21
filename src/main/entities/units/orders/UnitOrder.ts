import Unit from '../Unit';
import GameState from '../../../core/GameState';
import ImageFactory from '../../../graphics/images/ImageFactory';
import Ticker from '../../../core/Ticker';
import MapInstance from '../../../maps/MapInstance';
import { Session } from '../../../core/Session';

export type OrderContext = Readonly<{
  state: GameState;
  map: MapInstance;
  imageFactory: ImageFactory;
  session: Session;
}>;

/**
 * A UnitOrder is a single action that will consume the unit's turn.
 */
export default interface UnitOrder {
  execute: (unit: Unit, context: OrderContext) => Promise<void>;
}
