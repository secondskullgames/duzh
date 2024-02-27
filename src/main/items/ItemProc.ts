import InventoryItem from './InventoryItem';
import Unit from '../entities/units/Unit';
import { GameState, Session } from '@main/core';

export type ItemProc = (
  item: InventoryItem,
  unit: Unit,
  state: GameState,
  session: Session
) => Promise<void>;
