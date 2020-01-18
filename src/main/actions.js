{
  /**
   * @return Promise<void>
   */
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
    }, 0);
  }

  /**
   * @param {Unit} unit
   * @param {MapItem} mapItem
   */
  function pickupItem(unit, mapItem) {
    const { state, audio, Sounds } = jwb;
    const inventoryItem = mapItem.getInventoryItem();
    const { category } = inventoryItem;
    const { inventory } = unit;
    inventory[category] = inventory[category] || [];
    inventory[category].push(inventoryItem);
    state.inventoryIndex = state.inventoryIndex || 0;
    state.messages.push(`Picked up a ${inventoryItem.name}.`);
    audio.playSound(Sounds.PICK_UP_ITEM);
  }

  /**
   * @param {Unit} unit
   * @param {InventoryItem || null} item
   */
  function useItem(unit, item) {
    const { audio, state } = jwb;
    if (!!item) {
      item.use(unit);
      audio.playSound([[700,100],[1050,100],[1400,100]]);
      const items = unit.inventory[item.category];
      items.splice(jwb.state.inventoryIndex, 1);
      if (jwb.state.inventoryIndex >= items.length) {
        jwb.state.inventoryIndex--;
      }
    }
  }

  /**
   * @param {int} index
   */
  function loadMap(index) {
    const { state } = jwb;
    if (index >= state.mapSuppliers.length) {
      alert('YOU WIN!');
    } else {
      state.mapIndex = index;
      state.map = state.mapSuppliers[index].get();
    }
  }

  function moveOrAttack(unit, { x, y }) {
    const { audio } = jwb;
    const { map, messages, playerUnit } = jwb.state;
    if (map.contains(x, y) && !map.isBlocked(x, y)) {
      [unit.x, unit.y] = [x, y];
    } else {
      const otherUnit = map.getUnit(x, y);
      if (!!otherUnit) {
        const damage = unit.getDamage();
        otherUnit.life = Math.max(otherUnit.life - damage, 0);
        messages.push(`${unit.name} hit ${otherUnit.name} for ${damage} damage!`);
        if (otherUnit.life === 0) {
          map.units = map.units.filter(u => u !== otherUnit);
          audio.playSound([[800,40],[600,40],[400,40],[300,40],[200,40]]);
          if (otherUnit === playerUnit) {
            alert('Game Over!');
          }
          unit.gainExperience(1);
        } else {
          audio.playSound([[800,40],[600,40],[400,40]]);
        }
      }
    }
  }

  function restartGame() {
    const { MapFactory, SpriteRenderer, UnitFactory } = jwb;

    jwb.state = new GameState(UnitFactory.PLAYER({ x: 0, y: 0 }), [
      MapFactory.randomMap(30, 20, 10, 8),
      MapFactory.randomMap(32, 21, 12, 7),
      MapFactory.randomMap(34, 22, 14, 6),
      MapFactory.randomMap(36, 23, 16, 5),
      MapFactory.randomMap(38, 24, 18, 4),
      MapFactory.randomMap(30, 25, 20, 3),
    ]);

    //jwb.renderer = new AsciiRenderer();
    jwb.renderer = new SpriteRenderer();
    jwb.audio = new jwb.SoundPlayer();

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
