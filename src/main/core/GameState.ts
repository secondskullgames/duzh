import { clear } from '@lib/utils/arrays';
import { injectable } from 'inversify';

/**
 * Represents the "game world": persistent state that is shared across all current sessions.
 */
export interface GameState {
  getGeneratedEquipmentIds: () => string[];
  recordEquipmentGenerated: (equipmentId: string) => void;
  reset: () => void;
}

/**
 * Global mutable state
 */
@injectable()
export class GameStateImpl implements GameState {
  private readonly generatedEquipmentIds: string[];

  constructor() {
    this.generatedEquipmentIds = [];
  }

  getGeneratedEquipmentIds = (): string[] => this.generatedEquipmentIds;

  recordEquipmentGenerated = (equipmentId: string) => {
    this.generatedEquipmentIds.push(equipmentId);
  };

  reset = () => {
    clear(this.generatedEquipmentIds);
  };
}
