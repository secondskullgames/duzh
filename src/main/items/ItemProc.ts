import Unit from '../entities/units/Unit';
import InventoryItem from './InventoryItem';
import ImageFactory from '../graphics/images/ImageFactory';
import GameState from '../core/GameState';
import Ticker from '../core/Ticker';
import MapInstance from '../maps/MapInstance';
import SpriteFactory from '../graphics/sprites/SpriteFactory';

export type ItemProcContext = Readonly<{
  state: GameState,
  map: MapInstance,
  spriteFactory: SpriteFactory,
  ticker: Ticker
}>;

export type ItemProc = (
  item: InventoryItem,
  unit: Unit,
  context: ItemProcContext
) => Promise<void>;