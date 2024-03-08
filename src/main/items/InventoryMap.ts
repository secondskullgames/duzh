import InventoryItem from './InventoryItem';
import ItemCategory from '../../models/ItemCategory';

const itemCategories: ItemCategory[] = ['WEAPON', 'ARMOR', 'POTION', 'SCROLL', 'KEY'];

/**
 * Contains information about all items held by a particular unit, grouped by category,
 * as well as data about the selected item/category in the inventory menu
 * (although this is only applicable to the player unit)
 */
export default class InventoryMap {
  private readonly _map: Record<ItemCategory, InventoryItem[]>;

  constructor() {
    const map: Partial<Record<ItemCategory, InventoryItem[]>> = {};
    for (const category of itemCategories) {
      map[category] = [];
    }
    this._map = map as Record<ItemCategory, InventoryItem[]>;
  }

  add = (item: InventoryItem) => {
    this._map[item.category]?.push(item);
  };

  remove = (item: InventoryItem) => {
    const items = this._map[item.category];
    const index = items.indexOf(item);
    items.splice(index, 1);
  };

  get = (category: ItemCategory): InventoryItem[] => {
    return [...this._map[category]];
  };

  includes = (item: InventoryItem): boolean => {
    return this._map[item.category].includes(item);
  };
}
