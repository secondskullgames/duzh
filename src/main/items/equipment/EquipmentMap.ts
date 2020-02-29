import { EquipmentCategory } from '../../types/types';
import EquippedItem from './EquippedItem';

const categories: EquipmentCategory[] = Object.values(EquipmentCategory);

/**
 * Represent's a unit's equipment, mapped by slot.
 */
class EquipmentMap {
  private readonly _map: { [category in EquipmentCategory]: EquippedItem[] };

  constructor() {
    // @ts-ignore
    this._map = {};
    for (const category of categories) {
      this._map[<EquipmentCategory>category] = [];
    }
  }

  add(item: EquippedItem) {
    this._map[item.category].push(item);
  }

  remove(item: EquippedItem) {
    const items = this._map[item.category];
    const index = items.indexOf(item);
    items.splice(index, 1);
  }

  get(category: EquipmentCategory): EquippedItem[] {
    return [...this._map[category]];
  }

  getEntries(): [EquipmentCategory, EquippedItem[]][] {
    return [...(<[EquipmentCategory, EquippedItem[]][]>Object.entries(this._map))];
  }
}

export default EquipmentMap;