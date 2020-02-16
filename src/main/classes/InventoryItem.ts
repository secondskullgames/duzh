import { ItemCategory } from '../types';

class InventoryItem {
  readonly name: string;
  readonly category: ItemCategory;
  private readonly _onUse: (InventoryItem) => void;

  constructor(name, category, onUse) {
    /**
     * @type {!string}
     */
    this.name = name;
    this.category = category;
    this._onUse = onUse;
  }

  use() {
    this._onUse.call(null, this);
  }
}

export default InventoryItem;