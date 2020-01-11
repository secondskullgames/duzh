{
  function keyHandler(e) {
    const { renderer } = window.jwb;
    switch (e.key) {
      case 'w':
      case 'a':
      case 's':
      case 'd':
        _handleArrowKey(e.key);
        break;
      case ' ': // spacebar
        // Do nothing, but other units will update
        break;
      case 'Enter':
        _handleEnter();
        return;
      case 'Tab':
        _handleTab();
        e.preventDefault();
        break;
      default:
        return;
    }

    const { units } = window.jwb.state.map;

    units.forEach(u => u.update());
    renderer.render();
  }

  function _handleArrowKey(key) {
    const { playerUnit } = window.jwb.state;
    const { tryMove } = window.jwb.utils.unitBehavior;

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

    playerUnit.update = () => tryMove(playerUnit, playerUnit.x + dx, playerUnit.y + dy);
  }

  function _handleEnter() {
    const { Tiles } = window.jwb.types;
    const { map, mapIndex, playerUnit } = window.jwb.state;
    const { x, y } = playerUnit;
    const item = map.getItem(x, y);
    if (!!item) {
      playerUnit.pickupItem(item);
      map.removeItem({ x, y });
    } else if (map.getTile(x, y) === Tiles.STAIRS_DOWN) {
      window.jwb.state.loadMap(mapIndex + 1);
    }
  }

  function _handleTab() {
    console.log('tab');

    switch (window.jwb.state.screen) {
      case 'INVENTORY':
        window.jwb.state.screen = 'GAME';
        break;
      default:
        window.jwb.state.screen = 'INVENTORY';
        break;
    }
  }

  function attachEvents() {
    window.onkeydown = keyHandler;
  }

  window.jwb.input = {
    attachEvents,
    simulateKeyPress: keyHandler
  };
}
