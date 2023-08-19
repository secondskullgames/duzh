import Unit from '../Unit';
import GameState from '../../../core/GameState';
import Ticker from '../../../core/Ticker';
import MapInstance from '../../../maps/MapInstance';
import SpriteFactory from '../../../graphics/sprites/SpriteFactory';
import AnimationFactory from '../../../graphics/animations/AnimationFactory';
import ItemFactory from '../../../items/ItemFactory';

export type OrderContext = Readonly<{
  state: GameState,
  map: MapInstance,
  spriteFactory: SpriteFactory,
  animationFactory: AnimationFactory,
  itemFactory: ItemFactory,
  ticker: Ticker
}>;

export default interface UnitOrder {
  execute: (
    unit: Unit,
    context: OrderContext
  ) => Promise<void>
};