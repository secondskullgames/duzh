import Pathfinder from '../utils/Pathfinder';
import Unit from './Unit';
import { randChoice } from '../utils/RandomUtils';
import { Coordinates, Rect } from '../types/types';
import { comparingReversed } from '../utils/ArrayUtils';
import { coordinatesEquals, manhattanDistance } from '../maps/MapUtils';
import Directions from '../types/Directions';
import UnitAbilities from './UnitAbilities';

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
    const { dx, dy } = { dx: x - unit.x, dy: y - unit.y };
    return UnitAbilities.ATTACK.use(unit, { dx, dy });
  }
  return Promise.resolve();
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
    const { dx, dy } = { dx: x - unit.x, dy: y - unit.y };
    return UnitAbilities.ATTACK.use(unit, { dx, dy });
  }
  return Promise.resolve();
}

function _attackPlayerUnit_withPath(unit: Unit): Promise<void> {
  const { playerUnit } = jwb.state;
  const map = jwb.state.getMap();

  const mapRect: Rect = map.getRect();

  const unblockedTiles: Coordinates[] = [];
  for (let y = 0; y < mapRect.height; y++) {
    for (let x = 0; x < mapRect.width; x++) {
      if (!map.getTile({ x, y }).isBlocking) {
        unblockedTiles.push({ x, y });
      } else if (coordinatesEquals({ x, y }, playerUnit)) {
        unblockedTiles.push({ x, y });
      } else {
        // blocked
      }
    }
  }

  const path: Coordinates[] = new Pathfinder(() => 1).findPath(unit, playerUnit, unblockedTiles);

  if (path.length > 1) {
    const { x, y } = path[1]; // first tile is the unit's own tile
    const unitAtPoint = map.getUnit({ x, y });
    if (!unitAtPoint || unitAtPoint === playerUnit) {
      const { dx, dy } = { dx: x - unit.x, dy: y - unit.y };
      return UnitAbilities.ATTACK.use(unit, { dx, dy });
    }
  }
  return Promise.resolve();
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
    const orderedTiles = tiles.sort(comparingReversed(coordinates => manhattanDistance(coordinates, playerUnit)));
    const { x, y } = orderedTiles[0];
    const { dx, dy } = { dx: x - unit.x, dy: y - unit.y };
    return UnitAbilities.ATTACK.use(unit, { dx, dy });
  }
  return Promise.resolve();
}

const UnitBehaviors = {
  WANDER: _wander,
  ATTACK_PLAYER: _attackPlayerUnit_withPath,
  FLEE_FROM_PLAYER: _fleeFromPlayerUnit,
  STAY: () => Promise.resolve()
};

export default UnitBehaviors;
export { UnitBehavior };