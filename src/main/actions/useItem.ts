import Unit from '../entities/units/Unit';
import InventoryItem from '../items/InventoryItem';
import GameState from '../core/GameState';
import ImageFactory from '../graphics/images/ImageFactory';
import MapInstance from '../maps/MapInstance';
import { Session } from '../core/Session';

type Context = Readonly<{
  state: GameState;
  map: MapInstance;
  imageFactory: ImageFactory;
  session: Session;
}>;

export const useItem = async (
  unit: Unit,
  item: InventoryItem,
  { state, map, imageFactory, session }: Context
) => {
  await item.use(unit, { state, map, imageFactory, session });
  unit.getInventory().remove(item);
};
