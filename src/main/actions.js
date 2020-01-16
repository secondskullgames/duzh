{
  function render() {
    return jwb.renderer.render();
  }

  function update() {
    const { state } = jwb;

    state.playerUnit.update();
    render();

    setTimeout(() => {
      state.map.units
        .filter(u => u !== state.playerUnit)
        .forEach(u => u.update());

      render()
        .then(() => {
          state.turn++;
          state.messages = [];
        });
    }, 100);
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

  function moveOrAttack(unit, { x, y }) {
    const { map, messages, playerUnit } = jwb.state;
    if (map.contains(x, y) && !map.isBlocked(x, y)) {
      [unit.x, unit.y] = [x, y];
    } else {
      const otherUnit = map.getUnit(x, y);
      if (!!otherUnit) {
        const damage = unit.getDamage();
        otherUnit.currentHP = Math.max(otherUnit.currentHP - damage, 0);
        messages.push(`${unit.name} hit ${otherUnit.name} for ${damage} damage!`);
        if (otherUnit.currentHP === 0) {
          map.units = map.units.filter(u => u !== otherUnit);
          if (otherUnit === playerUnit) {
            alert('Game Over!');
          }
        }
      }
    }
  }

  window.jwb = window.jwb || {};
  jwb.actions = {
    render,
    update,
    pickupItem,
    useItem,
    loadMap,
    moveOrAttack
  };
}
