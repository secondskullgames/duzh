import Equipment from './Equipment';
import { EquipmentSlot } from '@duzh/models';
import { sortBy } from '@duzh/utils/arrays';

const orderedEquipmentSlots: EquipmentSlot[] = [
  EquipmentSlot.MELEE_WEAPON,
  EquipmentSlot.RANGED_WEAPON,
  EquipmentSlot.CHEST,
  EquipmentSlot.HEAD,
  EquipmentSlot.SHIELD,
  EquipmentSlot.LEGS,
  EquipmentSlot.CLOAK
];

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

  /**
   * @return equipment sorted by slot, according to {@link orderedEquipmentSlots}
   */
  getAll = (): Equipment[] => this._sortBySlot(Object.values(this._map));

  includes = (item: Equipment): boolean => this.getAll().includes(item);

  private _sortBySlot = (equipment: Equipment[]): Equipment[] => {
    return sortBy(equipment, e => orderedEquipmentSlots.indexOf(e.slot));
  };
}
