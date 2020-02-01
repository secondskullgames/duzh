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
    render()
      .then(() => {
        state.map.units
          .filter(u => u !== state.playerUnit)
          .forEach(u => u.update());

        render()
          .then(() => {
            state.turn++;
            state.messages = [];
          });
      });
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
    const { audio, state, Sounds } = jwb;
    if (!!item) {
      item.use(unit);
      audio.playSound(Sounds.USE_ITEM);
      const items = unit.inventory[item.category];
      items.splice(state.inventoryIndex, 1);
      if (state.inventoryIndex >= items.length) {
        state.inventoryIndex--;
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
    const { audio, Sounds } = jwb;
    const { playSound } = audio;
    const { map, messages, playerUnit } = jwb.state;
    if (map.contains(x, y) && !map.isBlocked(x, y)) {
      [unit.x, unit.y] = [x, y];
      if (unit === playerUnit) {
        playSound(Sounds.FOOTSTEP);
      }
    } else {
      const otherUnit = map.getUnit(x, y);
      if (!!otherUnit) {
        const damage = unit.getDamage();
        otherUnit.life = Math.max(otherUnit.life - damage, 0);
        messages.push(`${unit.name} hit ${otherUnit.name} for ${damage} damage!`);
        if (otherUnit.life === 0) {
          map.units = map.units.filter(u => u !== otherUnit);
          if (otherUnit === playerUnit) {
            alert('Game Over!');
            audio.playSound(Sounds.PLAYER_DIES);
          } else {
            audio.playSound(Sounds.ENEMY_DIES);
          }
          unit.gainExperience(1);
        } else {
          if (unit === playerUnit) {
            playSound(Sounds.PLAYER_HITS_ENEMY);
          } else {
            playSound(Sounds.ENEMY_HITS_PLAYER);
          }
        }
      }
    }
  }

  function restartGame() {
    const { MapFactory, SpriteRenderer, UnitFactory, Music } = jwb;
    const { randChoice } = jwb.utils.RandomUtils;

    jwb.state = new GameState(UnitFactory.PLAYER({ x: 0, y: 0 }), [
      MapFactory.randomMap(30, 20, 8, 4),
      MapFactory.randomMap(32, 21, 9, 4),
      MapFactory.randomMap(34, 22, 10, 4),
      MapFactory.randomMap(36, 23, 11, 3),
      MapFactory.randomMap(38, 24, 12, 3),
      MapFactory.randomMap(30, 25, 13, 3)
    ]);

    //jwb.renderer = new AsciiRenderer();
    jwb.renderer = new SpriteRenderer();

    jwb.actions.loadMap(0);
    jwb.input.attachEvents();
    jwb.renderer.render();
    jwb.Music.playSuite(randChoice([Music.SUITE_1, Music.SUITE_2]));
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
