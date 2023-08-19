import Unit from '../entities/units/Unit';
import InventoryItem from '../items/InventoryItem';
import GameState from '../core/GameState';
import Ticker from '../core/Ticker';
import MapInstance from '../maps/MapInstance';
import SpriteFactory from '../graphics/sprites/SpriteFactory';
import AnimationFactory from '../graphics/animations/AnimationFactory';
import UnitFactory from '../entities/units/UnitFactory';

type Context = Readonly<{
  state: GameState,
  map: MapInstance,
  spriteFactory: SpriteFactory,
  animationFactory: AnimationFactory,
  unitFactory: UnitFactory,
  ticker: Ticker
}>;

export const useItem = async (
  unit: Unit,
  item: InventoryItem,
  { state, map, spriteFactory, animationFactory, unitFactory, ticker }: Context
) => {
  await item.use(unit, { state, map, spriteFactory, animationFactory, unitFactory, ticker });
  unit.getInventory().remove(item);
};