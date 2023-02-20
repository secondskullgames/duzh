import UnitController from './UnitController';
import Unit from '../Unit';
import GameState from '../../core/GameState';
import { checkNotNull } from '../../utils/preconditions';
import UnitBehavior from '../UnitBehaviors';
import { manhattanDistance } from '../../maps/MapUtils';
import { canMove } from './ControllerUtils';
import { randBoolean } from '../../utils/random';

export default class HumanDeterministicController implements UnitController {
  issueOrder = async (unit: Unit) => {
    const playerUnit = GameState.getInstance().getPlayerUnit();

    const aiParameters = checkNotNull(unit.getAiParameters(), 'HUMAN_DETERMINISTIC behavior requires aiParams!');
    const { speed, visionRange, fleeThreshold } = aiParameters;

    let behavior: UnitBehavior;
    const distanceToPlayer = manhattanDistance(unit.getCoordinates(), playerUnit.getCoordinates());

    if (!canMove(speed)) {
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