import { EquipmentSlot } from '../../types/types';
import EquippedItem from './EquippedItem';

/**
 * Represent's a unit's equipment, mapped by slot.
 */
class EquipmentMap {
  private readonly _map: { [slot in EquipmentSlot]?: EquippedItem };

  constructor() {
    this._map = {};
  }

  add(item: EquippedItem) {
    this._map[item.slot] = item;
  }

  remove(item: EquippedItem) {
    this._map[item.slot] = undefined;
  }

  get(category: EquipmentSlot): EquippedItem | null {
    return this._map[category] || null;
  }

  getEntries(): [EquipmentSlot, EquippedItem][] {
    return [...(<[EquipmentSlot, EquippedItem][]>Object.entries(this._map))];
  }
}

export default EquipmentMap;