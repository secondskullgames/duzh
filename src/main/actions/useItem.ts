import Unit from '../entities/units/Unit';
import InventoryItem from '../items/InventoryItem';
import GameState from '../core/GameState';
import ImageFactory from '../graphics/images/ImageFactory';

type Context = Readonly<{
  state: GameState,
  imageFactory: ImageFactory
}>;

export const useItem = async (
  unit: Unit,
  item: InventoryItem,
  { state, imageFactory }: Context
) => {
  await item.use(unit, { state, imageFactory });
  unit.getInventory().remove(item);
};