import { manhattanDistance } from './utils/MapUtils';
import { weightedRandom } from './utils/RandomUtils';
import UnitBehaviors from './UnitBehaviors';
import Unit from './classes/Unit';

type UnitAI = (unit: Unit) => Promise<void>;

const HUMAN_CAUTIOUS: UnitAI = unit => {
  const { playerUnit } = jwb.state;

  let behavior;
  const distanceToPlayer = manhattanDistance(unit, playerUnit);

  if (distanceToPlayer === 1) {
    if ((unit.life / unit.maxLife) >= 0.4) {
      behavior = 'ATTACK_PLAYER';
    } else {
      behavior = weightedRandom({
        'ATTACK_PLAYER': 0.2,
        'WANDER': 0.5,
        'FLEE_FROM_PLAYER': 0.3
      });
    }
  } else if (distanceToPlayer >= 5) {
    behavior = weightedRandom({
      'WANDER': 0.3,
      'ATTACK_PLAYER': 0.1,
      'STAY': 0.6
    });
  } else {
    behavior = weightedRandom({
      'ATTACK_PLAYER': 0.6,
      'WANDER': 0.2,
      'STAY': 0.2
    });
  }
  return UnitBehaviors[behavior].call(null, unit);
};

const HUMAN_AGGRESSIVE: UnitAI = unit => {
  const { playerUnit } = jwb.state;

  let behavior;
  const distanceToPlayer = manhattanDistance(unit, playerUnit);

  if (distanceToPlayer === 1) {
    behavior = 'ATTACK_PLAYER';
  } else if (distanceToPlayer >= 6) {
    behavior = weightedRandom({
      'WANDER': 0.4,
      'STAY': 0.4,
      'ATTACK_PLAYER': 0.2
    });
  } else {
    behavior = weightedRandom({
      'ATTACK_PLAYER': 0.9,
      'STAY': 0.1
    });
  }
  return UnitBehaviors[behavior].call(null, unit);
};

const FULL_AGGRO: UnitAI = unit => UnitBehaviors.ATTACK_PLAYER.call(null, unit);

export {
  UnitAI,
  HUMAN_CAUTIOUS,
  HUMAN_AGGRESSIVE,
  FULL_AGGRO
};