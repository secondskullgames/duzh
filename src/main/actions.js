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

  function restartGame() {
    const { MapFactory, SpriteRenderer, UnitFactory } = jwb;

    jwb.state = new GameState(UnitFactory.PLAYER({ x: 0, y: 0 }), [
      MapFactory.randomMap(40, 20, 6, 8),
      MapFactory.randomMap(42, 21, 7, 7),
      MapFactory.randomMap(44, 22, 8, 6),
      MapFactory.randomMap(46, 23, 9, 5),
      MapFactory.randomMap(48, 24, 10, 4),
      MapFactory.randomMap(50, 25, 11, 3),
    ]);

    //jwb.renderer = new AsciiRenderer();
    jwb.renderer = new SpriteRenderer();

    jwb.actions.loadMap(0);
    jwb.input.attachEvents();
    jwb.renderer.render();
  }

  window.jwb = window.jwb || {};
  jwb.actions = {
    render,
    update,
    pickupItem,
    useItem,
    loadMap,
    moveOrAttack,
    restartGame
  };
}
