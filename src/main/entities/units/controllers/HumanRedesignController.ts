import { UnitController, UnitControllerContext } from './UnitController';
import Unit from '../Unit';
import { checkNotNull } from '../../../utils/preconditions';
import { manhattanDistance } from '../../../maps/MapUtils';
import { canMove } from './ControllerUtils';
import { randBoolean, randChance } from '../../../utils/random';
import StayOrder from '../orders/StayOrder';
import UnitOrder from '../orders/UnitOrder';
import AvoidUnitOrder from '../orders/AvoidUnitOrder';
import AttackUnitOrder from '../orders/AttackUnitOrder';
import WanderOrder from '../orders/WanderOrder';

export default class HumanRedesignController implements UnitController {
  /**
   * @override {@link UnitController#issueOrder}
   */
  issueOrder = (
    unit: Unit,
    { state }: UnitControllerContext
  ): UnitOrder => {
    const playerUnit = state.getPlayerUnit();

    const aiParameters = checkNotNull(unit.getAiParameters(), 'HumanRedesignController requires aiParams!');
    const { aggressiveness, speed, visionRange, fleeThreshold } = aiParameters;

    const distanceToPlayer = manhattanDistance(unit.getCoordinates(), playerUnit.getCoordinates());

    if (!canMove(speed, { state })) {
      return new StayOrder();
    } else if ((unit.getLife() / unit.getMaxLife()) < fleeThreshold) {
      return new AvoidUnitOrder({ targetUnit: playerUnit });
    } else if (distanceToPlayer <= visionRange) {
      if (unit.isInCombat()) {
        return new AttackUnitOrder({ targetUnit: playerUnit });
      } else if (randChance(aggressiveness)) {
        return new AttackUnitOrder({ targetUnit: playerUnit });
      } else {
        return new WanderOrder();
      }
    } else {
      if (randBoolean()) {
        return new StayOrder();
      } else {
        return new WanderOrder();
      }
    }
  }
};