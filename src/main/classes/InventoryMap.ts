import { ItemCategory } from '../types';
import InventoryItem from './InventoryItem';

const categories: ItemCategory[] = Object.values(ItemCategory);

/**
 * Contains information about all items held by a particular unit, grouped by category,
 * as well as data about the selected item/category in the inventory menu
 * (although this is only applicable to the player unit)
 */
class InventoryMap {
  private readonly _map: { [category in ItemCategory]: InventoryItem[] };
  selectedCategory: ItemCategory;
  selectedItem: InventoryItem | null;

  constructor() {
    // @ts-ignore
    this._map = {};
    for (const category of categories) {
      // TODO
      this._map[<ItemCategory>category] = [];
    }
    this.selectedCategory = categories[0];
    this.selectedItem = null;
  }

  add(item: InventoryItem) {
    this._map[item.category].push(item);
    if (this.selectedCategory === item.category && this.selectedItem === null) {
      this.selectedItem = item;
    }
  }

  remove(item: InventoryItem) {
    const items = this._map[item.category];
    const index = items.indexOf(item);
    items.splice(index, 1);
    if (this.selectedItem === item) {
      this.selectedItem = items[index % items.length] || null;
    }
  }

  nextCategory() {
    const index = categories.indexOf(this.selectedCategory);
    this.selectedCategory = categories[(index + 1) % categories.length];
    this.selectedItem = this._map[this.selectedCategory][0] || null;
  }

  previousCategory() {
    const index = categories.indexOf(this.selectedCategory);
    this.selectedCategory = categories[(index - 1) % categories.length];
    this.selectedItem = this._map[this.selectedCategory][0] || null;
  }

  get(category: ItemCategory): InventoryItem[] {
    return [...this._map[category]];
  }

  nextItem() {
    const items = this._map[this.selectedCategory];
    if (items.length > 0 && this.selectedItem !== null) {
      const index = items.indexOf(this.selectedItem);
      this.selectedItem = items[(index + 1) % items.length];
    }
  }

  previousItem() {
    const items = this._map[this.selectedCategory];
    if (items.length > 0 && this.selectedItem !== null) {
      const index = items.indexOf(this.selectedItem);
      this.selectedItem = items[(index - 1) % items.length];
    }
  }
}

export default InventoryMap;