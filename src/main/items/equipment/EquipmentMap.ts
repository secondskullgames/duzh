import { EquipmentSlot } from '../../types/types';
import Equipment from './Equipment';

/**
 * Represent's a unit's equipment, mapped by slot.
 */
class EquipmentMap {
  private readonly _map: { [slot in EquipmentSlot]?: Equipment };

  constructor() {
    this._map = {};
  }

  add(item: Equipment) {
    this._map[item.slot] = item;
  }

  remove(item: Equipment) {
    this._map[item.slot] = undefined;
  }

  get(category: EquipmentSlot): Equipment | null {
    return this._map[category] || null;
  }

  getEntries(): [EquipmentSlot, Equipment][] {
    return [...(<[EquipmentSlot, Equipment][]>Object.entries(this._map))];
  }

  getValues(): Equipment[] {
    return [...(<Equipment[]>Object.values(this._map))];
  }
}

export default EquipmentMap;