{
  /**
   * @param {Unit} unit
   */
  function tryMoveRandomly(unit) {
    const { map } = window.jwb.state;
    /** @type {{ x: int, y: int }[]} */
    const tiles = [];
    for (let [dx, dy] of [[0, -1], [1, 0], [0, 1], [-1, 0]]) {
      const [x, y] = [unit.x + dx, unit.y + dy];
      if (map.contains(x, y)) {
        if (!map.isBlocked(x, y) || map.getUnit(x, y)) {
          tiles.push({ x, y });
        }
      }
    }

    if (tiles.length > 0) {
      const { x, y } = tiles[Math.floor(Math.random() * tiles.length)];
      tryMove(unit, x, y);
    }
  }

  function tryMove(unit, x, y) {
    const { map, messages } = window.jwb.state;
    if (map.contains(x, y) && !map.isBlocked(x, y)) {
      [unit.x, unit.y] = [x, y];
    } else {
      const otherUnit = map.getUnit(x, y);
      if (!!otherUnit) {
        otherUnit.currentHP = Math.max(otherUnit.currentHP - 10, 0);
        messages.push(`${unit.name} hit ${otherUnit.name} for ${10} damage!`);
        if (otherUnit.currentHP === 0) {
          map.units = map.units.filter(u => u !== otherUnit);
        }
      }
    }
  }

  window.jwb = window.jwb || {};
  window.jwb.utils = window.jwb.utils || {};
  window.jwb.utils.UnitBehavior = { tryMove, tryMoveRandomly };
}