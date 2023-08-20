import Unit from '../entities/units/Unit';
import InventoryItem from '../items/InventoryItem';
import Game from '../core/Game';
import ImageFactory from '../graphics/images/ImageFactory';
import Ticker from '../core/Ticker';
import MapInstance from '../maps/MapInstance';

type Context = Readonly<{
  game: Game,
  map: MapInstance,
  imageFactory: ImageFactory,
  ticker: Ticker
}>;

export const useItem = async (
  unit: Unit,
  item: InventoryItem,
  { game, map, imageFactory, ticker }: Context
) => {
  await item.use(unit, { game, map, imageFactory, ticker });
  unit.getInventory().remove(item);
};