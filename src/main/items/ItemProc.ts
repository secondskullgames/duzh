import Unit from '../entities/units/Unit';
import InventoryItem from './InventoryItem';
import { GlobalContext } from '../core/GlobalContext';

export type ItemProc = (
  item: InventoryItem,
  unit: Unit,
  context: GlobalContext
) => Promise<void>;