import Unit from '../entities/units/Unit';
import InventoryItem from '../items/InventoryItem';
import GameState from '../core/GameState';
import MapInstance from '../maps/MapInstance';
import { Session } from '../core/Session';

type Context = Readonly<{
  state: GameState;
  map: MapInstance;
  session: Session;
}>;

export const useItem = async (
  unit: Unit,
  item: InventoryItem,
  { state, map, session }: Context
) => {
  await item.use(unit, { state, map, session });
  unit.getInventory().remove(item);
};
