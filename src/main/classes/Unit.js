/**
 * @constructor
 */
function Unit(x, y, name, maxHP) {
  let currentHP = maxHP;
  /**
   * @type {Object<String, InventoryItem[]>}
   */
  const inventory = {};
  Object.keys(window.jwb.types.ItemCategory).forEach(category => { inventory[category] = []; });

  /**
   * @param {MapItem} mapItem
   */
  function pickupItem(mapItem) {
    const inventoryItem = mapItem.getInventoryItem();
    const { category } = inventoryItem;
    inventory[category] = inventory[category] || [];
    inventory[category].push(inventoryItem);
  }

  this.class = 'Unit';
  this.x = x;
  this.y = y;
  this.name = name;
  this.currentHP = currentHP;
  this.maxHP = maxHP;
  this.inventory = inventory;
  this.update = () => {};
  this.pickupItem = pickupItem;
}
