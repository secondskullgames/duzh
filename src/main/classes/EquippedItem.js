/**
 * @param {string} name
 * @param {EquipmentCategory} category
 * @param {InventoryItem} inventoryItem
 * @param {Object<string, *>} stats
 * @constructor
 */
function EquippedItem(name, category, inventoryItem, stats) {
  this.class = 'EquippedItem';
  this.name = name;
  this.category = category;
  this.inventoryItem = inventoryItem;
  Object.entries(stats).forEach(([k, v]) => { this[k] = v; });
}
