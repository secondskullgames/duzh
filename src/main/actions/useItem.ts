import Unit from '../entities/units/Unit';
import InventoryItem from '../items/InventoryItem';
import { GameState } from '../core/GameState';
import { Session } from '../core/Session';

export const useItem = async (
  unit: Unit,
  item: InventoryItem,
  state: GameState,
  session: Session
) => {
  await item.use(unit, state, session);
  unit.getInventory().remove(item);
};
