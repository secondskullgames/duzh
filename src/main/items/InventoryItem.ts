import { ItemCategory } from '../types/types';
import Unit from '../units/Unit';

class InventoryItem {
  readonly name: string;
  readonly category: ItemCategory;
  private readonly _onUse: (unit: Unit) => Promise<any>;

  constructor(name: string, category: ItemCategory, onUse: (item: InventoryItem, unit: Unit) => Promise<void>) {
    this.name = name;
    this.category = category;
    this._onUse = (unit: Unit) => onUse(this, unit);
  }

  use(unit: Unit): Promise<any> {
    return this._onUse(unit);
  }
}

export default InventoryItem;