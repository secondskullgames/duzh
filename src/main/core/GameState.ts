import MapInstance from '../maps/MapInstance';
import { clear } from '@lib/utils/arrays';

/**
 * Represents the "game world": persistent state that is shared across all current sessions.
 */
export interface GameState {
  getGeneratedEquipmentIds: () => string[];
  recordEquipmentGenerated: (equipmentId: string) => void;
  reset: () => void;

  getMap: (mapIndex: number) => MapInstance;
  setMap: (mapIndex: number, map: MapInstance) => void;
  isMapLoaded: (mapIndex: number) => boolean;
}

/**
 * Global mutable state
 */
export class GameStateImpl implements GameState {
  private readonly maps: Record<number, MapInstance>;
  private readonly generatedEquipmentIds: string[];

  constructor() {
    this.maps = [];
    this.generatedEquipmentIds = [];
  }

  getGeneratedEquipmentIds = (): string[] => this.generatedEquipmentIds;

  recordEquipmentGenerated = (equipmentId: string) => {
    this.generatedEquipmentIds.push(equipmentId);
  };

  reset = () => {
    Object.keys(this.maps).forEach(key => {
      delete this.maps[parseInt(key)];
    });
    clear(this.generatedEquipmentIds);
  };

  isMapLoaded = (index: number): boolean => {
    return this.maps[index] !== undefined;
  };

  setMap = (mapIndex: number, map: MapInstance) => {
    this.maps[mapIndex] = map;
  };
  getMap = (mapIndex: number) => this.maps[mapIndex];
}
