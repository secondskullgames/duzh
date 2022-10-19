import GameState from '../../core/GameState';
import Direction from '../../geometry/Direction';
import { manhattanDistance } from '../../maps/MapUtils';
import { checkNotNull } from '../../utils/preconditions';
import { randBoolean, randChance, randChoice, random, weightedRandom } from '../../utils/random';
import Unit from '../Unit';
import UnitAbility from '../UnitAbility';
import UnitBehaviors from '../UnitBehaviors';
import UnitBehavior from '../UnitBehaviors';
import UnitController from './UnitController';
import Coordinates from '../../geometry/Coordinates';

const HUMAN_CAUTIOUS: UnitController = {
  issueOrder: async (unit: Unit) => {
    const playerUnit = GameState.getInstance().getPlayerUnit();
    const aiParameters = checkNotNull(unit.getUnitClass().aiParameters, 'HUMAN_CAUTIOUS behavior requires aiParams!');
    const { speed, visionRange } = aiParameters;
    const distanceToPlayer = manhattanDistance(unit.getCoordinates(), playerUnit.getCoordinates());

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

const HUMAN_AGGRESSIVE: UnitController = {
  issueOrder: async (unit: Unit) => {
    const playerUnit = GameState.getInstance().getPlayerUnit();

    let behavior: UnitBehavior;
    const distanceToPlayer = manhattanDistance(unit.getCoordinates(), playerUnit.getCoordinates());

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

const HUMAN_DETERMINISTIC: UnitController = {
  issueOrder: async (unit: Unit) => {
    const playerUnit = GameState.getInstance().getPlayerUnit();

    const aiParameters = checkNotNull(unit.getUnitClass().aiParameters, 'HUMAN_DETERMINISTIC behavior requires aiParams!');
    const { speed, visionRange, fleeThreshold } = aiParameters;

    let behavior: UnitBehavior;
    const distanceToPlayer = manhattanDistance(unit.getCoordinates(), playerUnit.getCoordinates());

    if (!_canMove(speed)) {
      behavior = UnitBehavior.STAY;
    } else if ((unit.getLife() / unit.getMaxLife()) < fleeThreshold) {
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

const HUMAN_REDESIGN: UnitController = {
  issueOrder: async (unit: Unit) => {
    const playerUnit = GameState.getInstance().getPlayerUnit();

    const aiParameters = checkNotNull(unit.getUnitClass().aiParameters, 'HUMAN_REDESIGN behavior requires aiParams!');
    const { aggressiveness, speed, visionRange, fleeThreshold } = aiParameters;

    let behavior: UnitBehavior;
    const distanceToPlayer = manhattanDistance(unit.getCoordinates(), playerUnit.getCoordinates());

    if (!_canMove(speed)) {
      behavior = UnitBehavior.STAY;
    } else if ((unit.getLife() / unit.getMaxLife()) < fleeThreshold) {
      behavior = UnitBehavior.FLEE_FROM_PLAYER;
    } else if (distanceToPlayer <= visionRange) {
      if (unit.isInCombat()) {
        behavior = UnitBehavior.ATTACK_PLAYER;
      } else if (randChance(aggressiveness)) {
        behavior = UnitBehavior.ATTACK_PLAYER;
      } else {
        behavior = UnitBehavior.WANDER;
      }
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

const ARCHER: UnitController = {
  issueOrder: async (unit: Unit) => {
    const playerUnit = GameState.getInstance().getPlayerUnit();

    const aiParameters = checkNotNull(unit.getUnitClass().aiParameters, 'ARCHER behavior requires aiParams!');
    const { aggressiveness, speed, visionRange, fleeThreshold } = aiParameters;

    let behavior: UnitBehavior;
    const distanceToPlayer = manhattanDistance(unit.getCoordinates(), playerUnit.getCoordinates());

    if (!_canMove(speed)) {
      behavior = UnitBehavior.STAY;
    } else if ((unit.getLife() / unit.getMaxLife()) < fleeThreshold) {
      behavior = UnitBehavior.FLEE_FROM_PLAYER;
    } else if (distanceToPlayer <= visionRange) {
      if (unit.isInCombat()) {
        behavior = UnitBehavior.SHOOT_PLAYER;
      } else if (randChance(aggressiveness)) {
        behavior = UnitBehavior.SHOOT_PLAYER;
      } else {
        behavior = UnitBehavior.WANDER;
      }
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

const WIZARD: UnitController = {
  issueOrder: async (unit: Unit) => {
    const state = GameState.getInstance();
    const playerUnit = state.getPlayerUnit();
    const map = state.getMap();

    const distanceToPlayerUnit = manhattanDistance(unit.getCoordinates(), playerUnit.getCoordinates());

    const canTeleport = unit.getAbilities().includes(UnitAbility.TELEPORT)
      && unit.getMana() >= UnitAbility.TELEPORT.manaCost;
    const canSummon = unit.getAbilities().includes(UnitAbility.SUMMON)
      && unit.getMana() >= UnitAbility.SUMMON.manaCost;

    if (canTeleport && distanceToPlayerUnit <= 3) {
      return UnitBehaviors.TELEPORT_FROM_PLAYER(unit);
    }

    if (canSummon && distanceToPlayerUnit >= 3) {
      const coordinates = Direction.values()
        .map(direction => Coordinates.plus(unit.getCoordinates(), direction))
        .filter(coordinates => map.contains(coordinates) && !map.isBlocked(coordinates))
        [0];
      if (coordinates) {
        return UnitAbility.SUMMON.use(unit, coordinates);
      }
    }

    return randChoice([
      UnitBehaviors.FLEE_FROM_PLAYER,
      UnitBehaviors.ATTACK_PLAYER,
      UnitBehaviors.WANDER
    ])(unit);
  }
};

const _canMove = (speed: number): boolean => {
  // deterministic version
  const turn = GameState.getInstance().getTurn();
  return Math.floor(speed * turn) > Math.floor(speed * (turn - 1));

  // random version
  // return Math.random() < speed;
};

export {
  ARCHER,
  HUMAN_AGGRESSIVE,
  HUMAN_CAUTIOUS,
  HUMAN_DETERMINISTIC,
  HUMAN_REDESIGN,
  WIZARD
};
