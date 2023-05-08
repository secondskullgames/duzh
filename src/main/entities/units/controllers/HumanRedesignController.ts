import UnitController, { UnitControllerProps } from './UnitController';
import Unit from '../Unit';
import { checkNotNull } from '../../../utils/preconditions';
import { manhattanDistance } from '../../../maps/MapUtils';
import { canMove } from './ControllerUtils';
import { randBoolean, randChance } from '../../../utils/random';
import StayBehavior from '../behaviors/StayBehavior';
import UnitBehavior from '../behaviors/UnitBehavior';
import AvoidUnitBehavior from '../behaviors/AvoidUnitBehavior';
import AttackUnitBehavior from '../behaviors/AttackUnitBehavior';
import WanderBehavior from '../behaviors/WanderBehavior';

export default class HumanRedesignController implements UnitController {
  issueOrder = async (
    unit: Unit,
    { state, renderer, imageFactory }: UnitControllerProps
  ) => {
    const playerUnit = state.getPlayerUnit();

    const aiParameters = checkNotNull(unit.getAiParameters(), 'HUMAN_REDESIGN behavior requires aiParams!');
    const { aggressiveness, speed, visionRange, fleeThreshold } = aiParameters;

    const distanceToPlayer = manhattanDistance(unit.getCoordinates(), playerUnit.getCoordinates());

    let behavior: UnitBehavior;
    if (!canMove(speed, { state })) {
      behavior = new StayBehavior();
    } else if ((unit.getLife() / unit.getMaxLife()) < fleeThreshold) {
      behavior = new AvoidUnitBehavior({ targetUnit: playerUnit });
    } else if (distanceToPlayer <= visionRange) {
      if (unit.isInCombat()) {
        behavior = new AttackUnitBehavior({ targetUnit: playerUnit });
      } else if (randChance(aggressiveness)) {
        behavior = new AttackUnitBehavior({ targetUnit: playerUnit });
      } else {
        behavior = new WanderBehavior();
      }
    } else {
      if (randBoolean()) {
        behavior = new StayBehavior();
      } else {
        behavior = new WanderBehavior();
      }
    }

    return behavior.execute(unit, {
      state,
      renderer,
      imageFactory
    });
  }
};