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

        jwb.actions.render()
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
        messages.push(`${unit.name} (${unit.level}) hit ${otherUnit.name} (${otherUnit.level}) for ${damage} damage!`);
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
    const { MapFactory, SpriteRenderer, Music, UnitClass } = jwb;
    const { randChoice } = jwb.utils.RandomUtils;

    const playerUnit = new Unit(UnitClass.PLAYER, 'player', 1, { x: 0, y: 0 });
    jwb.state = new GameState(playerUnit, [
      // test
      //MapFactory.randomMap(20, 10, 3, 1),

      MapFactory.randomMap(1, 30, 22, 5, 4),
      MapFactory.randomMap(2, 32, 23, 6, 4),
      MapFactory.randomMap(3, 34, 24, 7, 3),
      MapFactory.randomMap(4, 36, 25, 8, 3),
      MapFactory.randomMap(5, 38, 26, 9, 3),
      MapFactory.randomMap(6, 30, 27, 10, 3)
    ]);

    jwb.renderer = new SpriteRenderer();

    jwb.actions.loadMap(0);
    jwb.input.attachEvents();
    jwb.renderer.render();
    jwb.Music.playSuite(randChoice([Music.SUITE_1, Music.SUITE_2]));
  }

  /**
   * Add any tiles the player can currently see to the map's revealed tiles list.
   * @return void
   */
  function revealTiles() {
    const { map, playerUnit } = jwb.state;
    const { revealedTiles } = map;
    const { contains, coordinatesEquals } = jwb.utils.MapUtils;

    map.rooms.forEach(room => {
      if (contains(room, playerUnit)) {
        for (let y = room.top; y < room.top + room.height; y++) {
          for (let x = room.left; x < room.left + room.width; x++) {
            if (!revealedTiles.some(tile => coordinatesEquals(tile, { x, y }))) {
              revealedTiles.push({ x, y });
            }
          }
        }
      }
    });

    const radius = 2;

    for (let y = playerUnit.y - radius; y <= playerUnit.y + radius; y++) {
      for (let x = playerUnit.x - radius; x <= playerUnit.x + radius; x++) {
        if (!revealedTiles.some(tile => coordinatesEquals(tile, { x, y }))) {
          revealedTiles.push({ x, y });
        }
      }
    }
  }

  function debug() {
    jwb.DEBUG = true;
    jwb.renderer = new AsciiRenderer();
    render();
  }

  window.jwb = window.jwb || {};
  jwb.actions = {
    render,
    update,
    pickupItem,
    useItem,
    loadMap,
    moveOrAttack,
    restartGame,
    revealTiles,
    debug
  };
}
