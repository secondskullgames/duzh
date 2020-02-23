import { manhattanDistance } from './utils/MapUtils';
import { weightedRandom } from './utils/RandomUtils';
import UnitBehaviors, { UnitBehavior } from './UnitBehaviors';
import Unit from './classes/Unit';

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

  let behavior;
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

const FULL_AGGRO: UnitAI = unit => UnitBehaviors.ATTACK_PLAYER(unit);

export {
  UnitAI,
  HUMAN_CAUTIOUS,
  HUMAN_AGGRESSIVE,
  FULL_AGGRO
};