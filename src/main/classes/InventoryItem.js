/**
 * @param {string} name
 * @param {ItemCategory} category
 * @param {Function<Unit, void>} onUse
 *
 * @constructor
 */
function InventoryItem(name, category, onUse) {
  this.class = 'InventoryItem';
  this.name = name;
  this.category = category;
  this.use = onUse.bind(this);
}
