import MapInstance from '../maps/MapInstance';
import { clear } from '@lib/utils/arrays';
import { injectable } from 'inversify';
import { checkNotNull } from '@lib/utils/preconditions';

/**
 * Represents the "game world": persistent state that is shared across all current sessions.
 */
export interface GameState {
  getGeneratedEquipmentIds: () => string[];
  recordEquipmentGenerated: (equipmentId: string) => void;
  reset: () => void;

  getMap: (id: string) => MapInstance;
  setMap: (id: string, map: MapInstance) => void;
  isMapLoaded: (id: string) => boolean;
}

/**
 * Global mutable state
 */
@injectable()
export class GameStateImpl implements GameState {
  private readonly maps: Record<string, MapInstance>;
  private readonly generatedEquipmentIds: string[];

  constructor() {
    this.maps = {};
    this.generatedEquipmentIds = [];
  }

  getGeneratedEquipmentIds = (): string[] => this.generatedEquipmentIds;

  recordEquipmentGenerated = (equipmentId: string) => {
    this.generatedEquipmentIds.push(equipmentId);
  };

  reset = () => {
    Object.keys(this.maps).forEach(key => {
      delete this.maps[key];
    });
    clear(this.generatedEquipmentIds);
  };

  isMapLoaded = (id: string): boolean => {
    return this.maps[id] !== undefined;
  };

  setMap = (id: string, map: MapInstance) => {
    this.maps[id] = map;
  };

  getMap = (id: string): MapInstance => checkNotNull(this.maps[id]);
}
