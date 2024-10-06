import InventoryItem from './InventoryItem';
import Unit from '../units/Unit';

export type ItemProc = (item: InventoryItem, unit: Unit) => Promise<void>;
