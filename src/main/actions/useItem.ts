import Unit from '../entities/units/Unit';
import InventoryItem from '../items/InventoryItem';
import GameState from '../core/GameState';
import ImageFactory from '../graphics/images/ImageFactory';
import Ticker from '../core/Ticker';
import MapInstance from '../maps/MapInstance';
import SpriteFactory from '../graphics/sprites/SpriteFactory';

type Context = Readonly<{
  state: GameState,
  map: MapInstance,
  spriteFactory: SpriteFactory,
  ticker: Ticker
}>;

export const useItem = async (
  unit: Unit,
  item: InventoryItem,
  { state, map, spriteFactory, ticker }: Context
) => {
  await item.use(unit, { state, map, spriteFactory, ticker });
  unit.getInventory().remove(item);
};