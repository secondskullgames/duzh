import { EquipmentSlot } from '../../gen-schema/equipment-slot.schema';
import Equipment from './Equipment';

/**
 * Represents a unit's equipment, mapped by slot.
 */
export default class EquipmentMap {
  private readonly _map: Partial<Record<EquipmentSlot, Equipment>>;

  constructor() {
    this._map = {};
  }

  add = (item: Equipment) => {
    this._map[item.slot] = item;
  };

  remove = (item: Equipment) => {
    this._map[item.slot] = undefined;
  };

  getBySlot = (slot: EquipmentSlot): Equipment | null => this._map[slot] ?? null;

  getAll = (): Equipment[] => Object.values(this._map);
}
