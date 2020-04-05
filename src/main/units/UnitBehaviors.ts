import Pathfinder from '../utils/Pathfinder';
import Unit from './Unit';
import { randChoice } from '../utils/RandomUtils';
import { Coordinates, Rect } from '../types/types';
import { moveOrAttack } from './UnitUtils';
import { resolvedPromise } from '../utils/PromiseUtils';
import { sortBy, sortByReversed } from '../utils/ArrayUtils';
import { coordinatesEquals, manhattanDistance } from '../maps/MapUtils';
import Directions from '../types/Directions';

type UnitBehavior = (unit: Unit) => Promise<void>;

function _wanderAndAttack(unit: Unit): Promise<void> {
  const { playerUnit } = jwb.state;
  const map = jwb.state.getMap();
  const tiles: Coordinates[] = [];
  Directions.values().forEach(({ dx, dy }) => {
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

function _wander(unit: Unit): Promise<void> {
  const map = jwb.state.getMap();
  const tiles: Coordinates[] = [];
  Directions.values().forEach(({ dx, dy }) => {
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

function _fleeFromPlayerUnit(unit: Unit): Promise<void> {
  const { playerUnit } = jwb.state;
  const map = jwb.state.getMap();

  const tiles: Coordinates[] = [];
  Directions.values().forEach(({ dx, dy }) => {
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
    const orderedTiles = sortByReversed(tiles, coordinates => manhattanDistance(coordinates, playerUnit));
    const { x, y } = orderedTiles[0];
    return moveOrAttack(unit, { x, y });
  }
  return resolvedPromise();
}

const UnitBehaviors = {
  WANDER: _wander,
  ATTACK_PLAYER: _attackPlayerUnit_withPath,
  FLEE_FROM_PLAYER: _fleeFromPlayerUnit,
  STAY: () => resolvedPromise()
};

export default UnitBehaviors;
export { UnitBehavior };