import Unit from '../Unit';
import GameState from '../../../core/GameState';
import Ticker from '../../../core/Ticker';
import MapInstance from '../../../maps/MapInstance';

export type OrderContext = Readonly<{
  state: GameState,
  map: MapInstance,
  ticker: Ticker
}>;

export default interface UnitOrder {
  execute: (
    unit: Unit,
    context: OrderContext
  ) => Promise<void>
};