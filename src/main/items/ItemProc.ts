import InventoryItem from './InventoryItem';
import Unit from '../units/Unit';
import { GameState } from '@main/core/GameState';
import { Session } from '@main/core/Session';

export type ItemProc = (
  item: InventoryItem,
  unit: Unit,
  state: GameState,
  session: Session
) => Promise<void>;
