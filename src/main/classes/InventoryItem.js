/**
 * @param {string} name
 * @param {ItemCategory} category
 * @param {Function<InventoryItem, Unit, void>} onUse
 *
 * @constructor
 */
function InventoryItem(name, category, onUse) {
  this.class = 'InventoryItem';
  this.name = name;
  this.category = category;
  /**
   * @type {Function<Unit, void>}
   */
  this.use = onUse.bind(null, this);
}
