/**
 * @param {string} name
 * @param {EquipmentCategory} category
 * @param {InventoryItem} inventoryItem
 * @param {int} damage
 * @constructor
 */
function EquippedItem(name, category, inventoryItem, damage) {
  this.class = 'EquippedItem';
  this.name = name;
  this.category = category;
  this.inventoryItem = inventoryItem;
  this.damage = damage;
}
