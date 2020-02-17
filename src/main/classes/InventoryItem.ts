import { ItemCategory } from '../types';
import Unit from './Unit';

class InventoryItem {
  readonly name: string;
  readonly category: ItemCategory;
  private readonly _onUse: (InventoryItem) => void;

  constructor(name, category, onUse) {
    this.name = name;
    this.category = category;
    this._onUse = onUse;
  }

  use(unit: Unit) {
    this._onUse.call(null, this, unit);
  }
}

export default InventoryItem;