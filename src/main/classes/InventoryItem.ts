import { ItemCategory } from '../types';
import Unit from './Unit';

class InventoryItem {
  readonly name: string;
  readonly category: ItemCategory;
  private readonly _onUse: (InventoryItem) => Promise<any>;

  constructor(name, category, onUse) {
    this.name = name;
    this.category = category;
    this._onUse = onUse;
  }

  use(unit: Unit): Promise<any> {
    return this._onUse.call(null, this, unit);
  }
}

export default InventoryItem;