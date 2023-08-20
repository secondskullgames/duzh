import Unit from '../Unit';
import Game from '../../../core/Game';
import ImageFactory from '../../../graphics/images/ImageFactory';
import Ticker from '../../../core/Ticker';
import MapInstance from '../../../maps/MapInstance';

export type OrderContext = Readonly<{
  game: Game,
  map: MapInstance,
  imageFactory: ImageFactory,
  ticker: Ticker
}>;

export default interface UnitOrder {
  execute: (
    unit: Unit,
    context: OrderContext
  ) => Promise<void>
};