import Unit from '../entities/units/Unit';
import InventoryItem from '../items/InventoryItem';
import GameState from '../core/GameState';
import ImageFactory from '../graphics/images/ImageFactory';
import Ticker from '../core/Ticker';

type Context = Readonly<{
  state: GameState,
  imageFactory: ImageFactory,
  ticker: Ticker
}>;

export const useItem = async (
  unit: Unit,
  item: InventoryItem,
  { state, imageFactory, ticker }: Context
) => {
  await item.use(unit, { state, imageFactory, ticker });
  unit.getInventory().remove(item);
};