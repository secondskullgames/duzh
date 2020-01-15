{
  /**
   * @param {Unit} unit
   */
  function tryMoveRandomly(unit) {
    const { map, playerUnit } = jwb.state;
    /** @type {{ x: int, y: int }[]} */
    const tiles = [];
    [[0, -1], [1, 0], [0, 1], [-1, 0]].forEach(([dx, dy]) => {
      const [x, y] = [unit.x + dx, unit.y + dy];
      if (map.contains(x, y)) {
        if (!map.isBlocked(x, y)) {
          tiles.push({ x, y });
        } else if (map.getUnit(x, y)) {
          if (map.getUnit(x, y) === playerUnit) {
            tiles.push({ x, y });
          }
        }
      }
    });

    if (tiles.length > 0) {
      const { x, y } = tiles[Math.floor(Math.random() * tiles.length)];
      tryMove(unit, x, y);
    }
  }

  function tryMove(unit, x, y) {
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

  jwb = jwb || {};
  jwb.utils = jwb.utils || {};
  jwb.utils.unitBehavior = { tryMove, tryMoveRandomly };
}
