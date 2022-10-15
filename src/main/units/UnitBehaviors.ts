import GameState from '../core/GameState';
import Rect from '../geometry/Rect';
import { manhattanDistance } from '../maps/MapUtils';
import Coordinates from '../geometry/Coordinates';
import Direction from '../geometry/Direction';
import { comparingReversed } from '../utils/arrays';
import Pathfinder from '../geometry/Pathfinder';
import { randChoice } from '../utils/random';
import Unit from './Unit';
import UnitAbility from './UnitAbility';

type UnitBehavior = (unit: Unit) => Promise<void>;

const _wanderAndAttack = async (unit: Unit) => {
  const state = GameState.getInstance();
  const playerUnit = state.getPlayerUnit();
  const map = state.getMap();
  const tiles: Coordinates[] = [];

  for (const { dx, dy } of Direction.values()) {
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
  }

  if (tiles.length > 0) {
    const { x, y } = randChoice(tiles);
    await UnitAbility.ATTACK.use(unit, { x, y });
  }
};

const _wander = async (unit: Unit) => {
  const state = GameState.getInstance();
  const map = state.getMap();
  const tiles: Coordinates[] = [];

  for (const { dx, dy } of Direction.values()) {
    const [x, y] = [unit.x + dx, unit.y + dy];
    if (map.contains({ x, y })) {
      if (!map.isBlocked({ x, y })) {
        tiles.push({ x, y });
      }
    }
  }

  if (tiles.length > 0) {
    const { x, y } = randChoice(tiles);
    await UnitAbility.ATTACK.use(unit, { x, y });
  }
};

const _attackPlayerUnit_withPath = async (unit: Unit) => {
  const state = GameState.getInstance();
  const playerUnit = state.getPlayerUnit();
  const map = state.getMap();
  const mapRect: Rect = map.getRect();
  const unblockedTiles: Coordinates[] = [];

  for (let y = 0; y < mapRect.height; y++) {
    for (let x = 0; x < mapRect.width; x++) {
      if (!map.getTile({ x, y }).isBlocking) {
        unblockedTiles.push({ x, y });
      } else if (Coordinates.equals({ x, y }, playerUnit)) {
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
      await UnitAbility.ATTACK.use(unit, { x, y });
    }
  }
};

const _shootPlayerUnit = async (unit: Unit) => {
  const state = GameState.getInstance();
  const playerUnit = state.getPlayerUnit();
  const map = state.getMap();

  if (unit.mana < UnitAbility.SHOOT_ARROW.manaCost) {
    return _attackPlayerUnit_withPath(unit);
  }
  if (unit.x !== playerUnit.x && unit.y !== playerUnit.y) {
    return _attackPlayerUnit_withPath(unit);
  }
  if (manhattanDistance(unit, playerUnit) <= 1) {
    return _attackPlayerUnit_withPath(unit);
  }

  let { x, y } = unit;
  const dx = Math.sign(playerUnit.x - x);
  const dy = Math.sign(playerUnit.y - y);
  x += dx;
  y += dy;

  while (x !== playerUnit.x || y !== playerUnit.y) {
    if (map.isBlocked({ x, y })) {
      return _attackPlayerUnit_withPath(unit);
    }
    x += dx;
    y += dy;
  }

  await UnitAbility.SHOOT_ARROW.use(unit, { x, y });
};

const _teleportFromPlayerUnit = async (unit: Unit) => {
  const state = GameState.getInstance();
  const playerUnit = state.getPlayerUnit();
  const map = state.getMap();
  const tiles: Coordinates[] = [];

  for (let y = 0; y < map.height; y++) {
    for (let x = 0; x < map.width; x++) {
      if (map.contains({ x, y })) {
        if (!map.isBlocked({ x, y })) {
          if (manhattanDistance(unit, { x, y }) <= UnitAbility.TELEPORT.RANGE) {
            tiles.push({ x, y });
          }
        }
      }
    }
  }

  if (tiles.length > 0) {
    const orderedTiles = tiles.sort(comparingReversed(coordinates => manhattanDistance(coordinates, playerUnit)));

    const { x, y } = orderedTiles[0];
    await UnitAbility.TELEPORT.use(unit, { x, y });
  }
};

const _fleeFromPlayerUnit = async (unit: Unit) => {
  const state = GameState.getInstance();
  const playerUnit = state.getPlayerUnit();
  const map = state.getMap();
  const tiles: Coordinates[] = [];

  for (const { dx, dy } of Direction.values()) {
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
  }

  if (tiles.length > 0) {
    const orderedTiles = tiles.sort(comparingReversed(coordinates => manhattanDistance(coordinates, playerUnit)));

    const { x, y } = orderedTiles[0];
    await UnitAbility.ATTACK.use(unit, { x, y });
  }
};

namespace UnitBehavior {
  export const WANDER = _wander;
  export const ATTACK_PLAYER = _attackPlayerUnit_withPath;
  export const SHOOT_PLAYER = _shootPlayerUnit;
  export const FLEE_FROM_PLAYER = _fleeFromPlayerUnit;
  export const STAY = () => Promise.resolve();
  export const TELEPORT_FROM_PLAYER = _teleportFromPlayerUnit;
}

export default UnitBehavior;
