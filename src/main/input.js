{
  function keyHandler(e) {
    switch (e.key) {
      case 'w':
      case 'a':
      case 's':
      case 'd':
        _handleArrowKey(e.key);
        break;
      case ' ': // spacebar
        _render(true);
        break;
      case 'Enter':
        _handleEnter();
        return;
      case 'Tab':
        _handleTab();
        e.preventDefault();
        break;
      default:
    }
  }

  /**
   * @param {boolean} update
   */
  function _render(update) {
    const { state, renderer } = window.jwb;
    const { screen } = state;

    if (update) {
      const { units } = window.jwb.state.map;

      units.forEach(u => u.update());
    }

    renderer.render();
  }

  function _handleArrowKey(key) {
    const { state } = window.jwb;
    const { playerUnit, screen } = state;
    const { tryMove } = window.jwb.utils.unitBehavior;
    const { inventory } = playerUnit;

    switch (screen) {
      case 'GAME':
        let [dx, dy] = [];
        switch (key) {
          case 'w':
            [dx, dy] = [0, -1];
            break;
          case 'a':
            [dx, dy] = [-1, 0];
            break;
          case 's':
            [dx, dy] = [0, 1];
            break;
          case 'd':
            [dx, dy] = [1, 0];
            break;
          default:
            throw `Invalid key ${key}`;
        }

        playerUnit.update = () => {
          tryMove(playerUnit, playerUnit.x + dx, playerUnit.y + dy);
          playerUnit.update = () => {};
        };
        break;
      case 'INVENTORY':
        const { inventoryCategory } = state;
        const items = inventory[inventoryCategory];
        const inventoryKeys = Object.keys(inventory);
        let keyIndex = inventoryKeys.indexOf(inventoryCategory);
        switch (key) {
          case 'w':
            state.inventoryIndex = (state.inventoryIndex + items.length - 1) % items.length;
            break;
          case 'a': {
            keyIndex = (keyIndex + inventoryKeys.length - 1) % inventoryKeys.length;
            state.inventoryCategory = inventoryKeys[keyIndex];
            state.inventoryIndex = 0;
            break;
          }
          case 's':
            state.inventoryIndex = (state.inventoryIndex + 1) % items.length;
            break;
          case 'd': {
            keyIndex = (keyIndex + 1) % inventoryKeys.length;
            state.inventoryCategory = inventoryKeys[keyIndex];
            state.inventoryIndex = 0;
            break;
          }
        }
    }
    _render(screen === 'GAME');
  }

  function _handleEnter() {
    const { state, actions } = jwb;
    const { playerUnit, screen } = state;
    const { inventory } = playerUnit;
    const { pickupItem, useItem, loadMap} = actions;

    switch (screen) {
      case 'GAME': {
        const { Tiles } = jwb.types;
        const { map, mapIndex } = state;
        const { x, y } = playerUnit;
        const item = map.getItem(x, y);
        if (!!item) {
          pickupItem(playerUnit, item);
          map.removeItem({ x, y });
        } else if (map.getTile(x, y) === Tiles.STAIRS_DOWN) {
          loadMap(mapIndex + 1);
        }
        break;
      }
      case 'INVENTORY': {
        const { inventoryCategory, inventoryIndex } = state;
        const items = inventory[inventoryCategory];
        const item = items[inventoryIndex] || null;
        useItem(playerUnit, item);
        break;
      }
    }
    _render(screen === 'GAME');
  }

  function _handleTab() {
    const { state } = jwb;
    const { playerUnit } = state;

    switch (state.screen) {
      case 'INVENTORY':
        state.screen = 'GAME';
        break;
      default:
        state.screen = 'INVENTORY';
        state.inventoryCategory = state.inventoryCategory || Object.keys(playerUnit.inventory)[0] || null;
        break;
    }
    _render(false);
  }

  function attachEvents() {
    window.onkeydown = keyHandler;
  }

  jwb = jwb || {};

  jwb.input = {
    attachEvents,
    simulateKeyPress: keyHandler
  };
}
