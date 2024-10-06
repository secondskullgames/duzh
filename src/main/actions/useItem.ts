import Unit from '../units/Unit';
import InventoryItem from '../items/InventoryItem';
import { ItemCategory } from '@models/ItemCategory';
import { Globals } from '@main/core/globals';

export const useItem = async (unit: Unit, item: InventoryItem) => {
  const { engine } = Globals;
  await item.use(unit);
  unit.getInventory().remove(item);
  if (item.category === ItemCategory.SCROLL) {
    await engine.playTurn();
  }
};
