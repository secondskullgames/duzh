import InventoryItem from './InventoryItem';
import ItemCategory from '../schemas/ItemCategory';

const itemCategories: ItemCategory[] = ['WEAPON', 'ARMOR', 'POTION', 'SCROLL', 'KEY'];
/**
 * Display these in a particular order and don't show keys
 */
const displayCategories: ItemCategory[] = ['WEAPON', 'ARMOR', 'POTION', 'SCROLL'];

/**
 * Contains information about all items held by a particular unit, grouped by category,
 * as well as data about the selected item/category in the inventory menu
 * (although this is only applicable to the player unit)
 */
class InventoryMap {
  private readonly _map: Record<ItemCategory, InventoryItem[]>;
  selectedCategory: ItemCategory;
  selectedItem: InventoryItem | null;

  constructor() {
    const map: Partial<Record<ItemCategory, InventoryItem[]>> = {};
    for (const category of itemCategories) {
      map[category] = [];
    }
    this._map = map as Record<ItemCategory, InventoryItem[]>;
    this.selectedCategory = displayCategories[0];
    this.selectedItem = null;
  }

  add(item: InventoryItem) {
    this._map[item.category]?.push(item);
    if (this.selectedCategory === item.category && this.selectedItem === null) {
      this.selectedItem = item;
    }
  }

  remove(item: InventoryItem) {
    const items = this._map[item.category];
    const index = items.indexOf(item);
    items.splice(index, 1);
    if (this.selectedItem === item) {
      this.selectedItem = items[index % items.length] ?? null;
    }
  }

  nextCategory() {
    const index = displayCategories.indexOf(this.selectedCategory);
    this.selectedCategory = displayCategories[(index + 1) % displayCategories.length];
    this.selectedItem = this._map[this.selectedCategory][0] ?? null;
  }

  previousCategory() {
    const index = displayCategories.indexOf(this.selectedCategory);
    this.selectedCategory = displayCategories[(index - 1 + displayCategories.length) % displayCategories.length];
    this.selectedItem = this._map[this.selectedCategory][0] ?? null;
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
      this.selectedItem = items[(index - 1 + items.length) % items.length];
    }
  }

  getCategories = (): ItemCategory[] => displayCategories;
}

export default InventoryMap;
