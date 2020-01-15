{
  /**
   * @param {boolean} update
   */
  function render(update) {
    const { state, renderer } = jwb;

    if (update) {
      const { units } = state.map;

      units.forEach(u => u.update());
    }

    renderer.render();
    if (update) {
      jwb.state.turn++; // TODO - is there a concern that the renderer will print the wrong value?
    }
  }

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
    jwb.state.messages.push(`Picked up a ${inventoryItem.name}.`);
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
    if (index >= jwb.state.mapSuppliers.length) {
      alert('YOU WIN!');
    } else {
      jwb.state.mapIndex = index;
      jwb.state.map = jwb.state.mapSuppliers[index].get();
    }
  }

  window.jwb = window.jwb || {};
  jwb.actions = {
    render,
    pickupItem,
    useItem,
    loadMap
  };
}
