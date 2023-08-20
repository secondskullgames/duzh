import Unit from '../entities/units/Unit';
import InventoryItem from './InventoryItem';
import ImageFactory from '../graphics/images/ImageFactory';
import Game from '../core/Game';
import Ticker from '../core/Ticker';
import MapInstance from '../maps/MapInstance';

export type ItemProcContext = Readonly<{
  game: Game,
  map: MapInstance,
  imageFactory: ImageFactory,
  ticker: Ticker
}>;

export type ItemProc = (
  item: InventoryItem,
  unit: Unit,
  context: ItemProcContext
) => Promise<void>;