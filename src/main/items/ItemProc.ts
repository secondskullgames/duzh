import InventoryItem from './InventoryItem';
import Unit from '../entities/units/Unit';
import ImageFactory from '../graphics/images/ImageFactory';
import GameState from '../core/GameState';
import MapInstance from '../maps/MapInstance';
import { Session } from '../core/Session';

export type ItemProcContext = Readonly<{
  state: GameState;
  map: MapInstance;
  imageFactory: ImageFactory;
  session: Session;
}>;

export type ItemProc = (
  item: InventoryItem,
  unit: Unit,
  context: ItemProcContext
) => Promise<void>;
