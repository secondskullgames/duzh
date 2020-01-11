function Unit(x, y, name, maxHP) {
  let currentHP = maxHP;
  /**
   * @type {Object<String, InventoryItem[]>}
   */
  const inventory = {};

  /**
   * @param {MapItem} mapItem
   */
  function pickupItem(mapItem) {
    const inventoryItem = mapItem.getInventoryItem();
    const { category } = inventoryItem;
    this.inventory[category] = this.inventory[category] || [];
    this.inventory[category].push(inventoryItem);
  }

  return {
    class: 'Unit',
    x,
    y,
    name,
    currentHP,
    maxHP,
    inventory,
    update: () => {},
    pickupItem
  };
}
