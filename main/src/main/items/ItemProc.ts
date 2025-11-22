import InventoryItem from './InventoryItem';
import Unit from '../units/Unit';
import { Game } from '@main/core/Game';

export type ItemProc = (item: InventoryItem, unit: Unit, game: Game) => Promise<void>;
