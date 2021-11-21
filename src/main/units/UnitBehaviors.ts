import GameState from '../core/GameState';
import { manhattanDistance } from '../maps/MapUtils';
import Direction from '../types/Direction';
import { Coordinates, Rect } from '../types/types';
import { comparingReversed } from '../utils/ArrayUtils';
import Pathfinder from '../utils/Pathfinder';
import { randChoice } from '../utils/random';
import Unit from './Unit';
import UnitAbility from './UnitAbility';

type UnitBehavior = (unit: Unit) => Promise<void>;

const _wanderAndAttack = async (unit: Unit) => {
  const state = GameState.getInstance();
  const { playerUnit } = state;
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
    const { dx, dy } = { dx: x - unit.x, dy: y - unit.y };
    await UnitAbility.ATTACK.use(unit, { dx, dy });
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
    const { dx, dy } = { dx: x - unit.x, dy: y - unit.y };
    await UnitAbility.ATTACK.use(unit, { dx, dy });
  }
};

const _attackPlayerUnit_withPath = async (unit: Unit) => {
  const state = GameState.getInstance();
  const { playerUnit } = state;
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
      const { dx, dy } = { dx: x - unit.x, dy: y - unit.y };
      await UnitAbility.ATTACK.use(unit, { dx, dy });
    }
  }
};

const _fleeFromPlayerUnit = async (unit: Unit) => {
  const state = GameState.getInstance();
  const { playerUnit } = state;
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
    const { dx, dy } = { dx: x - unit.x, dy: y - unit.y };
    await UnitAbility.ATTACK.use(unit, { dx, dy });
  }
};

namespace UnitBehavior {
  export const WANDER = _wander;
  export const ATTACK_PLAYER = _attackPlayerUnit_withPath;
  export const FLEE_FROM_PLAYER = _fleeFromPlayerUnit;
  export const STAY = () => Promise.resolve();
}

export default UnitBehavior;
