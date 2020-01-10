class InventoryItem {
  /**
   * @type {Function<Unit, void>}
   */
  onUse;

  constructor(onUse) {
    this.onUse = onUse;
  }

  use(unit) {
    this.onUse(unit);
  }
}