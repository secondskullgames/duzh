import Unit from '../entities/units/Unit';
import InventoryItem from '../items/InventoryItem';
import GameState from '../core/GameState';
import Ticker from '../core/Ticker';
import MapInstance from '../maps/MapInstance';

type Context = Readonly<{
  state: GameState,
  map: MapInstance,
  ticker: Ticker
}>;

export const useItem = async (
  unit: Unit,
  item: InventoryItem,
  { state, map, ticker }: Context
) => {
  await item.use(unit, { state, map, ticker });
  unit.getInventory().remove(item);
};