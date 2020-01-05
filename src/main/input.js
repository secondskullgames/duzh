{
  function keyHandler(key) {
    const { renderer } = window.jwb;
    const { units } = window.jwb.state.map;

    switch (key) {
      case 'w':
      case 'a':
      case 's':
      case 'd':
        _handleMovement(key);
        break;
      case '>':
        _handleStairsDown();
        break;
      case ' ':
      case '.':
        // Do nothing, but other units will update
        break;
      default:
        return;
    }

    units.forEach(u => u.update());
    renderer.render();
  }

  function _handleMovement(key) {
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

  function _handleStairsDown() {
    window.jwb.state.loadMap(window.jwb.state.mapIndex + 1);
  }

  function attachEvents() {
    window.onkeydown = e => keyHandler(e.key);
  }

  window.jwb.input = {
    attachEvents,
    simulateKeyPress: keyHandler
  };
}