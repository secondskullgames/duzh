{
  window.onkeypress = e => {
    const { units, playerUnit } = window.jwb.state.map;
    const { tryMove } = window.jwb.units;
    let [dx, dy] = [];
    switch (e.key) {
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
    }

    if (!![dx, dy]) {
      playerUnit.update = () => tryMove(playerUnit, playerUnit.x + dx, playerUnit.y + dy);
    }

    units.forEach(u => u.update());

    window.jwb.renderer.render();
  };
}