{
  /**
   * @param {Unit} unit
   * @param {MapItem} mapItem
   */
  function pickupItem(unit, mapItem) {
    const inventoryItem = mapItem.getInventoryItem();
    const { category } = inventoryItem;
    const { inventory } = unit;
    inventory[category] = inventory[category] || [];
    inventory[category].push(inventoryItem);
    jwb.state.inventoryIndex = jwb.state.inventoryIndex || 0;
  }

  /**
   * @param {Unit} unit
   * @param {InventoryItem || null} item
   */
  function useItem(unit, item) {
    if (!!item) {
      item.use(unit);
      const items = unit.inventory[item.category];
      items.splice(item, 1);
      if (jwb.state.inventoryIndex >= items.length) {
        jwb.state.inventoryIndex--;
      }
    }
  }

  /**
   * @param {int} index
   */
  function loadMap(index) {
    jwb.state.mapIndex = index;
    jwb.state.map = jwb.state.mapSuppliers[index].get();
  }

  jwb.actions = {
    pickupItem,
    useItem,
    loadMap
  };
}
