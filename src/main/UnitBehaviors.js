{
  /**
   * @param {Unit} unit
   */
  function wanderAndAttack(unit) {
    const { map, playerUnit } = jwb.state;
    const { RandomUtils } = jwb.utils;
    const { moveOrAttack } = jwb.actions;
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
      const { x, y } = RandomUtils.randChoice(tiles);
      moveOrAttack(unit, { x, y });
    }
  }

  /**
   * @param {Unit} unit
   */
  function wander(unit) {
    const { map } = jwb.state;
    const { RandomUtils } = jwb.utils;
    const { moveOrAttack } = jwb.actions;
    /** @type {{ x: int, y: int }[]} */
    const tiles = [];
    [[0, -1], [1, 0], [0, 1], [-1, 0]].forEach(([dx, dy]) => {
      const [x, y] = [unit.x + dx, unit.y + dy];
      if (map.contains(x, y)) {
        if (!map.isBlocked(x, y)) {
          tiles.push({ x, y });
        }
      }
    });

    if (tiles.length > 0) {
      const { x, y } = RandomUtils.randChoice(tiles);
      moveOrAttack(unit, { x, y });
    }
  }

  function attackPlayerUnit(unit) {
    const { map, playerUnit } = jwb.state;
    const { distance } = jwb.utils.MapUtils;
    const { moveOrAttack } = jwb.actions;
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
      const { x, y } = _sortBy(tiles, coordinates => distance(coordinates, playerUnit))[0];
      moveOrAttack(unit, { x, y });
    }
  }

  function fleeFromPlayerUnit(unit) {
    const { map, playerUnit } = jwb.state;
    const { distance } = jwb.utils.MapUtils;
    const { moveOrAttack } = jwb.actions;
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
      const { x, y } = _sortBy(tiles, coordinates => distance(coordinates, playerUnit))[tiles.length - 1];
      moveOrAttack(unit, { x, y });
    }
  }

  function _sortBy(list, mapFunction) {
    return list.sort((a, b) => mapFunction(a) - mapFunction(b));
  }

  jwb = jwb || {};
  jwb.UnitBehaviors = {
    WANDER: wander,
    ATTACK_PLAYER: attackPlayerUnit,
    FLEE_FROM_PLAYER: fleeFromPlayerUnit,
    STAY: () => {}
  }
}
