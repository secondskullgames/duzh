import { InventoryItem } from '@main/items/InventoryItem';
import { Unit } from '@main/entities/units';
import { GameState, Session } from '@main/core';

export const useItem = async (
  unit: Unit,
  item: InventoryItem,
  state: GameState,
  session: Session
) => {
  await item.use(unit, state, session);
  unit.getInventory().remove(item);
};
