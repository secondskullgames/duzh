import InventoryItem from './InventoryItem';
import Unit from '../entities/units/Unit';
import ImageFactory from '../graphics/images/ImageFactory';
import GameState from '../core/GameState';
import Ticker from '../core/Ticker';
import MapInstance from '../maps/MapInstance';

export type ItemProcContext = Readonly<{
  state: GameState;
  map: MapInstance;
  imageFactory: ImageFactory;
  ticker: Ticker;
}>;

export type ItemProc = (
  item: InventoryItem,
  unit: Unit,
  context: ItemProcContext
) => Promise<void>;
