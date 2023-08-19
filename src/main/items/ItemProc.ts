import Unit from '../entities/units/Unit';
import InventoryItem from './InventoryItem';
import GameState from '../core/GameState';
import Ticker from '../core/Ticker';
import MapInstance from '../maps/MapInstance';
import SpriteFactory from '../graphics/sprites/SpriteFactory';
import AnimationFactory from '../graphics/animations/AnimationFactory';
import UnitFactory from '../entities/units/UnitFactory';

export type ItemProcContext = Readonly<{
  state: GameState,
  map: MapInstance,
  spriteFactory: SpriteFactory,
  animationFactory: AnimationFactory,
  unitFactory: UnitFactory,
  ticker: Ticker
}>;

export type ItemProc = (
  item: InventoryItem,
  unit: Unit,
  context: ItemProcContext
) => Promise<void>;