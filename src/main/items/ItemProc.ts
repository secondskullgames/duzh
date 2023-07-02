import Unit from '../entities/units/Unit';
import InventoryItem from './InventoryItem';
import ImageFactory from '../graphics/images/ImageFactory';
import GameState from '../core/GameState';
import Ticker from '../core/Ticker';

export type ItemProcContext = Readonly<{
  state: GameState,
  imageFactory: ImageFactory,
  ticker: Ticker
}>;

export type ItemProc = (
  item: InventoryItem,
  unit: Unit,
  context: ItemProcContext
) => Promise<void>;