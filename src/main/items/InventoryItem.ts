import Unit from '../units/Unit';
import ItemCategory from './ItemCategory';

class InventoryItem {
  readonly name: string;
  readonly category: ItemCategory;
  private readonly onUse: (unit: Unit) => Promise<void>;

  constructor(name: string, category: ItemCategory, onUse: (item: InventoryItem, unit: Unit) => Promise<void>) {
    this.name = name;
    this.category = category;
    this.onUse = (unit: Unit) => onUse(this, unit);
  }

  use = (unit: Unit) => this.onUse(unit);
}

export default InventoryItem;
