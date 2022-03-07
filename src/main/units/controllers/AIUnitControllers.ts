import GameState from '../../core/GameState';
import { manhattanDistance } from '../../maps/MapUtils';
import { checkNotNull } from '../../utils/preconditions';
import { randBoolean, weightedRandom } from '../../utils/random';
import Unit from '../Unit';
import UnitAbility from '../UnitAbility';
import UnitBehavior from '../UnitBehaviors';
import UnitController from './UnitController';

const HUMAN_CAUTIOUS: UnitController = {
  issueOrder: async (unit: Unit) => {
    const playerUnit = GameState.getInstance().getPlayerUnit();
    const aiParameters = checkNotNull(unit.getUnitClass().aiParameters, 'HUMAN_CAUTIOUS behavior requires aiParams!');
    const { speed, visionRange } = aiParameters;
    const distanceToPlayer = manhattanDistance(unit, playerUnit);

    let behavior: UnitBehavior;

    if (!_canMove(speed)) {
      behavior = UnitBehavior.STAY;
    } else if (distanceToPlayer === 1) {
      behavior = weightedRandom({
        'ATTACK_PLAYER': 0.7,
        'FLEE_FROM_PLAYER': 0.3
      }, UnitBehavior);
    } else if (distanceToPlayer <= visionRange) {
      behavior = UnitBehavior.ATTACK_PLAYER;
    } else {
      behavior = UnitBehavior.WANDER;
    }
    return behavior(unit);
  }
};

const HUMAN_AGGRESSIVE = {
  issueOrder: async (unit: Unit) => {
    const playerUnit = GameState.getInstance().getPlayerUnit();

    let behavior: UnitBehavior;
    const distanceToPlayer = manhattanDistance(unit, playerUnit);

    if (distanceToPlayer === 1) {
      behavior = UnitBehavior.ATTACK_PLAYER;
    } else if (distanceToPlayer >= 6) {
      behavior = weightedRandom({
        'WANDER': 0.4,
        'STAY': 0.4,
        'ATTACK_PLAYER': 0.2
      }, UnitBehavior);
    } else {
      behavior = weightedRandom({
        'ATTACK_PLAYER': 0.9,
        'STAY': 0.1
      }, UnitBehavior);
    }
    return behavior(unit);
  }
};

const HUMAN_DETERMINISTIC = {
  issueOrder: async (unit: Unit) => {
    const playerUnit = GameState.getInstance().getPlayerUnit();

    const aiParameters = checkNotNull(unit.getUnitClass().aiParameters, 'HUMAN_DETERMINISTIC behavior requires aiParams!');
    const { speed, visionRange, fleeThreshold } = aiParameters;

    let behavior: UnitBehavior;
    const distanceToPlayer = manhattanDistance(unit, playerUnit);

    if (!_canMove(speed)) {
      behavior = UnitBehavior.STAY;
    } else if ((unit.life / unit.maxLife) < fleeThreshold) {
      behavior = UnitBehavior.FLEE_FROM_PLAYER;
    } else if (distanceToPlayer <= visionRange) {
      behavior = UnitBehavior.ATTACK_PLAYER;
    } else {
      if (randBoolean()) {
        behavior = UnitBehavior.STAY;
      } else {
        behavior = UnitBehavior.WANDER;
      }
    }
    return behavior(unit);
  }
};

const WIZARD = {
  issueOrder: async (unit: Unit) => {
    const state = GameState.getInstance();
    const map = state.getMap();

    for (const dy of [-2, 0, 2]) {
      for (const dx of [-2, 0, 2]) {
        if (dx === 0 && dy === 0) {
          continue;
        }
        if (dx !== 0 && dy !== 0) {
          continue;
        }

        const x = unit.x + dx;
        const y = unit.y + dy;
        if (!map.isBlocked({ x, y })) {
          const direction = { dx: dx / 2, dy: dy / 2};
          await UnitAbility.TELEPORT.use(unit, direction);
          return;
        }
      }
    }
  }
};

const _canMove = (speed: number): boolean => {
  // deterministic version
  // const { turn } = GameState.getInstance();
  // return Math.floor(speed * turn) > Math.floor(speed * (turn - 1));

  // random version
  return Math.random() < speed;
};

export {
  HUMAN_CAUTIOUS,
  HUMAN_AGGRESSIVE,
  HUMAN_DETERMINISTIC,
  WIZARD
};
