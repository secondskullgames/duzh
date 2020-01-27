/**
 * @param {string} name
 * @param {ItemCategory} category
 * @param {Function} onUse
 *
 * @constructor
 */
function InventoryItem(name, category, onUse) {
  this.class = 'InventoryItem';
  this.name = name;
  this.category = category;
  /**
   * @type {Function}
   */
  this.use = onUse.bind(null, this);
}
