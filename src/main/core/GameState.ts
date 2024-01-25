import MapInstance from '../maps/MapInstance';
import { type UnitAbility } from '../entities/units/abilities/UnitAbility';
import { checkArgument, checkNotNull } from '../utils/preconditions';
import { MapSupplier } from '../maps/MapSupplier';
import { clear } from '../utils/arrays';

/**
 * Global mutable state
 */
export default class GameState {
  private readonly mapSuppliers: MapSupplier[];
  private readonly maps: Record<number, MapInstance>;
  private mapIndex: number;
  private map: MapInstance | null;
  private turn: number;
  private queuedAbility: UnitAbility | null;
  private readonly generatedEquipmentIds: string[];

  constructor() {
    this.mapSuppliers = [];
    this.maps = [];
    this.mapIndex = -1;
    this.map = null;
    this.turn = 1;
    this.queuedAbility = null;
    this.generatedEquipmentIds = [];
  }

  hasNextMap = () => this.mapIndex < this.mapSuppliers.length - 1;
  getMapIndex = () => this.mapIndex;

  setMapIndex = async (mapIndex: number): Promise<MapInstance> => {
    checkArgument(mapIndex >= 0 && mapIndex < this.mapSuppliers.length);
    this.mapIndex = mapIndex;
    if (!this.maps[mapIndex]) {
      const mapSupplier = this.mapSuppliers[this.mapIndex];
      const map = await mapSupplier();
      this.maps[mapIndex] = map;
      this.map = map;
    }
    return this.maps[mapIndex];
  };

  addMaps = (suppliers: MapSupplier[]) => {
    this.mapSuppliers.push(...suppliers);
  };

  getMap = (): MapInstance =>
    checkNotNull(this.map, 'Tried to retrieve map before map was loaded');

  setMap = (map: MapInstance) => {
    this.map = map;
  };

  getTurn = () => this.turn;
  nextTurn = () => {
    this.turn++;
  };

  getQueuedAbility = (): UnitAbility | null => this.queuedAbility;
  setQueuedAbility = (ability: UnitAbility | null) => {
    this.queuedAbility = ability;
  };

  getGeneratedEquipmentIds = (): string[] => this.generatedEquipmentIds;

  recordEquipmentGenerated = (equipmentId: string) => {
    this.generatedEquipmentIds.push(equipmentId);
  };

  reset = () => {
    clear(this.mapSuppliers);
    Object.keys(this.maps).forEach(key => {
      delete this.maps[parseInt(key)];
    });
    this.mapIndex = -1;
    this.map = null;
    this.turn = 1;
    this.queuedAbility = null;
    clear(this.generatedEquipmentIds);
  };
}
