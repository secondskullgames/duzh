{
  /**
   * @param {!string} name
   * @param {!EquipmentCategory} category
   * @param {!InventoryItem} inventoryItem
   * @param {!int} damage
   * @constructor
   */
  function EquippedItem(name, category, inventoryItem, damage) {
    /**
     * @type {!string}
     */
    this.class = 'EquippedItem';
    /**
     * @type {!string}
     */
    this.name = name;
    /**
     * @type {!EquipmentCategory}
     */
    this.category = category;
    /**
     * @type {!InventoryItem}
     */
    this.inventoryItem = inventoryItem;
    /**
     * @type {!int}
     */
    this.damage = damage;
  }
}
