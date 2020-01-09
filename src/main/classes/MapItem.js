class MapItem {
  x;
  y;
  /**
   * @type {Function<void, InventoryItem>}
   */
  itemSupplier;

  constructor(x, y, itemSupplier) {
    this.x = x;
    this.y = y;
    this.itemSupplier = itemSupplier;
  }

  /**
   * @return {InventoryItem}
   */
  getInventoryItem() {
    return this.itemSupplier();
  }
}