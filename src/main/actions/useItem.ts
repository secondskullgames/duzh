import Unit from '../entities/units/Unit';
import InventoryItem from '../items/InventoryItem';
import { GlobalContext } from '../core/GlobalContext';

export const useItem = async (
  unit: Unit,
  item: InventoryItem,
  context: GlobalContext
) => {
  await item.use(unit, context);
  unit.getInventory().remove(item);
};