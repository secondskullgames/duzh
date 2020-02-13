{
  const CARDINAL_DIRECTIONS = [[0, -1], [1, 0], [0, 1], [-1, 0]];
  /**
   * @param {!Unit} unit
   */
  function wanderAndAttack(unit) {
    const { map, playerUnit } = jwb.state;
    const { RandomUtils } = jwb.utils;
    const { moveOrAttack } = jwb.actions;

    /** @type {{ x: int, y: int }[]} */
    const tiles = [];
    CARDINAL_DIRECTIONS.forEach(([dx, dy]) => {
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
   * @param {!Unit} unit
   */
  function wander(unit) {
    const { map } = jwb.state;
    const { RandomUtils } = jwb.utils;
    const { moveOrAttack } = jwb.actions;

    /** @type {{ x: int, y: int }[]} */
    const tiles = [];
    CARDINAL_DIRECTIONS.forEach(([dx, dy]) => {
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

  /**
   * @param {!Unit} unit
   * @private
   */
  function _attackPlayerUnit_withPath(unit) {
    const { map, playerUnit } = jwb.state;
    const { moveOrAttack } = jwb.actions;
    const { coordinatesEquals } = jwb.utils.MapUtils;

    const mapRect = { left: 0, top: 0, width: map.width, height: map.height };

    const blockedTileDetector = ({ x, y }) => {
      if (!jwb.state.map.getTile(x, y).isBlocking) {
        return false;
      } else if (coordinatesEquals({ x, y }, playerUnit)) {
        return false;
      }
      return true;
    };

    /**
     * @type {!Coordinates[]}
     */
    const path = new jwb.Pathfinder(blockedTileDetector, () => 1).findPath(unit, playerUnit, mapRect);

    if (path.length > 1) {
      const { x, y } = path[1]; // first tile is the unit's own tile
      const unitAtPoint = map.getUnit( x, y );
      if (!unitAtPoint || unitAtPoint === playerUnit) {
        moveOrAttack(unit, { x, y });
      }
    }
  }

  /**
   * @param {!Unit} unit
   */
  function fleeFromPlayerUnit(unit) {
    const { map, playerUnit } = jwb.state;
    const { manhattanDistance } = jwb.utils.MapUtils;
    const { moveOrAttack } = jwb.actions;

    /** @type {!Coordinates[]} */
    const tiles = [];
    CARDINAL_DIRECTIONS.forEach(([dx, dy]) => {
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
      const { x, y } = _sortBy(tiles, coordinates => manhattanDistance(coordinates, playerUnit))[tiles.length - 1];
      moveOrAttack(unit, { x, y });
    }
  }

  function _sortBy(list, mapFunction) {
    return list.sort((a, b) => mapFunction(a) - mapFunction(b));
  }

  jwb = jwb || {};
  jwb.UnitBehaviors = {
    WANDER: wander,
    ATTACK_PLAYER: _attackPlayerUnit_withPath,
    FLEE_FROM_PLAYER: fleeFromPlayerUnit,
    STAY: () => {}
  }
}
