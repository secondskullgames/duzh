import Unit from '../entities/units/Unit';
import InventoryItem from './InventoryItem';
import ImageFactory from '../graphics/images/ImageFactory';
import GameState from '../core/GameState';

export type ItemProcContext = Readonly<{
  state: GameState,
  imageFactory: ImageFactory
}>;

export type ItemProc = (
  item: InventoryItem,
  unit: Unit,
  context: ItemProcContext
) => Promise<void>;