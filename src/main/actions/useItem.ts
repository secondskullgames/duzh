import Unit from '../units/Unit';
import InventoryItem from '../items/InventoryItem';
import { ItemCategory } from '@models/ItemCategory';
import { Engine } from '@main/core/Engine';

export const useItem = async (unit: Unit, item: InventoryItem, engine: Engine) => {
  const state = engine.getState();
  const session = engine.getSession();
  await item.use(unit, state, session);
  unit.getInventory().remove(item);
  if (item.category === ItemCategory.SCROLL) {
    await engine.playTurnCycle();
  }
};
