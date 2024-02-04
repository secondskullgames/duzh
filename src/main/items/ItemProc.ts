import InventoryItem from './InventoryItem';
import Unit from '../entities/units/Unit';
import { GameState } from '../core/GameState';
import { Session } from '../core/Session';

export type ItemProc = (
  item: InventoryItem,
  unit: Unit,
  state: GameState,
  session: Session
) => Promise<void>;
