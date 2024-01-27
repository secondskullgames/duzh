import MapInstance from '../maps/MapInstance';
import { checkArgument } from '../utils/preconditions';
import { MapSupplier } from '../maps/MapSupplier';
import { clear } from '../utils/arrays';

/**
 * Global mutable state
 */
export default class GameState {
  private readonly mapSuppliers: MapSupplier[];
  private readonly maps: Record<number, MapInstance>;
  private readonly generatedEquipmentIds: string[];

  constructor() {
    this.mapSuppliers = [];
    this.maps = [];
    this.generatedEquipmentIds = [];
  }

  addMaps = (suppliers: MapSupplier[]) => {
    this.mapSuppliers.push(...suppliers);
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
    clear(this.generatedEquipmentIds);
  };

  hasNextMap = (currentIndex: number) => currentIndex < this.mapSuppliers.length - 1;

  loadMap = async (mapIndex: number): Promise<MapInstance> => {
    checkArgument(
      mapIndex >= 0 && mapIndex < this.mapSuppliers.length,
      'Invalid map index: ' + mapIndex
    );
    if (!this.maps[mapIndex]) {
      const mapSupplier = this.mapSuppliers[mapIndex];
      const map = await mapSupplier();
      this.maps[mapIndex] = map;
    }
    return this.maps[mapIndex];
  };
}
