import Equipment from './Equipment';
import EquipmentSlot from '../../models/EquipmentSlot';

/**
 * Represents a unit's equipment, mapped by slot.
 */
export default class EquipmentMap {
  private readonly _map: {
    [slot in EquipmentSlot]?: Equipment;
  };

  constructor() {
    this._map = {};
  }

  add = (item: Equipment) => {
    this._map[item.slot] = item;
  };

  remove = (item: Equipment) => {
    delete this._map[item.slot];
  };

  getBySlot = (slot: EquipmentSlot): Equipment | null => this._map[slot] ?? null;

  getAll = (): Equipment[] => Object.values(this._map);

  includes = (item: Equipment): boolean => this.getAll().includes(item);
}
