import { coordinatesEquals, manhattanDistance } from './utils/MapUtils';
import Pathfinder from './classes/Pathfinder';
import Unit from './classes/Unit';
import { randChoice } from './utils/RandomUtils';
import { Coordinates, Rect } from './types';
import { moveOrAttack } from './utils/UnitUtils';
import { resolvedPromise } from './utils/PromiseUtils';
import { sortBy } from './utils/ArrayUtils';

const CARDINAL_DIRECTIONS = [[0, -1], [1, 0], [0, 1], [-1, 0]];

type UnitBehavior = (unit: Unit) => Promise<void>;

function wanderAndAttack(unit: Unit): Promise<void> {
  const { playerUnit } = jwb.state;
  const map = jwb.state.getMap();

  const tiles: Coordinates[] = [];
  CARDINAL_DIRECTIONS.forEach(([dx, dy]) => {
    const [x, y] = [unit.x + dx, unit.y + dy];
    if (map.contains({ x, y })) {
      if (!map.isBlocked({ x, y })) {
        tiles.push({ x, y });
      } else if (map.getUnit({ x, y })) {
        if (map.getUnit({ x, y }) === playerUnit) {
          tiles.push({ x, y });
        }
      }
    }
  });

  if (tiles.length > 0) {
    const { x, y } = randChoice(tiles);
    return moveOrAttack(unit, { x, y });
  }
  return resolvedPromise();
}

function wander(unit: Unit): Promise<void> {
  const map = jwb.state.getMap();
  const tiles: Coordinates[] = [];
  CARDINAL_DIRECTIONS.forEach(([dx, dy]) => {
    const [x, y] = [unit.x + dx, unit.y + dy];
    if (map.contains({ x, y })) {
      if (!map.isBlocked({ x, y })) {
        tiles.push({ x, y });
      }
    }
  });

  if (tiles.length > 0) {
    const { x, y } = randChoice(tiles);
    return moveOrAttack(unit, { x, y });
  }
  return resolvedPromise();
}

function _attackPlayerUnit_withPath(unit: Unit): Promise<void> {
  const { playerUnit } = jwb.state;
  const map = jwb.state.getMap();

  const mapRect: Rect = map.getRect();

  const blockedTileDetector = ({ x, y }: Coordinates) => {
    if (!map.getTile({ x, y }).isBlocking) {
      return false;
    } else if (coordinatesEquals({ x, y }, playerUnit)) {
      return false;
    }
    return true;
  };

  const path: Coordinates[] = new Pathfinder(blockedTileDetector, () => 1).findPath(unit, playerUnit, mapRect);

  if (path.length > 1) {
    const { x, y } = path[1]; // first tile is the unit's own tile
    const unitAtPoint = map.getUnit({ x, y });
    if (!unitAtPoint || unitAtPoint === playerUnit) {
      return moveOrAttack(unit, { x, y });
    }
  }
  return resolvedPromise();
}

function fleeFromPlayerUnit(unit: Unit): Promise<void> {
  const { playerUnit } = jwb.state;
  const map = jwb.state.getMap();

  const tiles: Coordinates[] = [];
  CARDINAL_DIRECTIONS.forEach(([dx, dy]) => {
    const [x, y] = [unit.x + dx, unit.y + dy];
    if (map.contains({ x, y })) {
      if (!map.isBlocked({ x, y })) {
        tiles.push({ x, y });
      } else if (map.getUnit({ x, y })) {
        if (map.getUnit({ x, y }) === playerUnit) {
          tiles.push({ x, y });
        }
      }
    }
  });

  if (tiles.length > 0) {
    const { x, y } = sortBy(tiles, coordinates => manhattanDistance(coordinates, playerUnit))[tiles.length - 1];
    return moveOrAttack(unit, { x, y });
  }
  return resolvedPromise();
}

const UnitBehaviors: { [name: string]: UnitBehavior } = {
  WANDER: wander,
  ATTACK_PLAYER: _attackPlayerUnit_withPath,
  FLEE_FROM_PLAYER: fleeFromPlayerUnit,
  STAY: () => resolvedPromise()
};

export default UnitBehaviors;
export { UnitBehavior };