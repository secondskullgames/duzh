import Unit from './Unit';
import UnitBehaviors, { UnitBehavior } from './UnitBehaviors';
import { manhattanDistance } from '../maps/MapUtils';
import { randInt, weightedRandom } from '../utils/RandomUtils';

/**
 * A UnitAI is anything that an AI-controlled unit can do in a turn.
 * Specifically, it's a combination of UnitBehavior's, chosen based on
 * unit state and random variation.
 */
type UnitAI = (unit: Unit) => Promise<void>;

const behaviorMap = {
  'ATTACK_PLAYER': UnitBehaviors.ATTACK_PLAYER,
  'WANDER': UnitBehaviors.WANDER,
  'FLEE_FROM_PLAYER': UnitBehaviors.FLEE_FROM_PLAYER,
  'STAY': UnitBehaviors.STAY
};

const HUMAN_CAUTIOUS: UnitAI = unit => {
  const { playerUnit } = jwb.state;

  let behavior: UnitBehavior;
  const distanceToPlayer = manhattanDistance(unit, playerUnit);

  if (distanceToPlayer === 1) {
    if ((unit.life / unit.maxLife) >= 0.4) {
      behavior = UnitBehaviors.ATTACK_PLAYER;
    } else {
      behavior = weightedRandom({
        'ATTACK_PLAYER': 0.2,
        'WANDER': 0.5,
        'FLEE_FROM_PLAYER': 0.3
      }, behaviorMap);
    }
  } else if (distanceToPlayer >= 5) {
    behavior = weightedRandom({
      'WANDER': 0.3,
      'ATTACK_PLAYER': 0.1,
      'STAY': 0.6
    }, behaviorMap);
  } else {
    behavior = weightedRandom({
      'ATTACK_PLAYER': 0.6,
      'WANDER': 0.2,
      'STAY': 0.2
    }, behaviorMap);
  }
  return behavior(unit);
};

const HUMAN_AGGRESSIVE: UnitAI = unit => {
  const { playerUnit } = jwb.state;

  let behavior: UnitBehavior;
  const distanceToPlayer = manhattanDistance(unit, playerUnit);

  if (distanceToPlayer === 1) {
    behavior = UnitBehaviors.ATTACK_PLAYER;
  } else if (distanceToPlayer >= 6) {
    behavior = weightedRandom({
      'WANDER': 0.4,
      'STAY': 0.4,
      'ATTACK_PLAYER': 0.2
    }, behaviorMap);
  } else {
    behavior = weightedRandom({
      'ATTACK_PLAYER': 0.9,
      'STAY': 0.1
    }, behaviorMap);
  }
  return behavior(unit);
};

const HUMAN_DETERMINISTIC: UnitAI = unit => {
  const { playerUnit, turn } = jwb.state;

  const { aiParams } = unit.unitClass;
  if (!aiParams) {
    throw 'HUMAN_DETERMINISTIC behavior requires aiParams!';
  }
  const { speed, visionRange, fleeThreshold } = aiParams;

  let behavior: UnitBehavior;
  const distanceToPlayer = manhattanDistance(unit, playerUnit);

  if (!_canMove(speed)) {
    behavior = UnitBehaviors.STAY;
  } else if ((unit.life / unit.maxLife) < fleeThreshold) {
    behavior = UnitBehaviors.FLEE_FROM_PLAYER;
  } else if (distanceToPlayer <= visionRange) {
    behavior = UnitBehaviors.ATTACK_PLAYER;
  } else {
    if (randInt(0, 1) === 1) {
      behavior = UnitBehaviors.STAY;
    } else {
      behavior = UnitBehaviors.WANDER;
    }
  }
  return behavior(unit);
};

function _canMove(speed: number) {
  // deterministic version
  // const { turn } = jwb.state;
  // return Math.floor(speed * turn) > Math.floor(speed * (turn - 1));

  // random version
  return Math.random() < speed;
}

export {
  UnitAI,
  HUMAN_CAUTIOUS,
  HUMAN_AGGRESSIVE,
  HUMAN_DETERMINISTIC
};