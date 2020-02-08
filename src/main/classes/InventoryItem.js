{
  /**
   * @param {!string} name
   * @param {!ItemCategory} category
   * @param {!function(!InventoryItem, !Unit): void} onUse
   *
   * @constructor
   */
  function InventoryItem(name, category, onUse) {
    this.class = 'InventoryItem';
    /**
     * @type {!string}
     */
    this.name = name;
    this.category = category;
    /**
     * @type {!function(!Unit): void}
     */
    this.use = onUse.bind(null, this);
  }

  jwb.InventoryItem = InventoryItem;
}