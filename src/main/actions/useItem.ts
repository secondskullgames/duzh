import Unit from '../entities/units/Unit';
import InventoryItem from '../items/InventoryItem';

export const useItem = async (unit: Unit, item: InventoryItem) => {
  await item.use(unit);
  unit.getInventory().remove(item);
};