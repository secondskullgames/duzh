import Unit from '../Unit';
import { UnitController, type UnitControllerProps } from './UnitController';
import { checkNotNull } from '../../../utils/preconditions';
import { manhattanDistance } from '../../../maps/MapUtils';
import { canMove } from './ControllerUtils';
import { randBoolean, randChance } from '../../../utils/random';
import UnitOrder from '../orders/UnitOrder';
import StayOrder from '../orders/StayOrder';
import AvoidUnitOrder from '../orders/AvoidUnitOrder';
import ShootUnitOrder from '../orders/ShootUnitOrder';
import WanderOrder from '../orders/WanderOrder';

export default class ArcherController implements UnitController {
  /**
   * @override {@link UnitController#issueOrder}
   */
  issueOrder = (
    unit: Unit,
    { state }: UnitControllerProps
  ): UnitOrder => {
    const playerUnit = state.getPlayerUnit();

    const aiParameters = checkNotNull(unit.getAiParameters(), 'ArcherController requires aiParams!');
    const { aggressiveness, speed, visionRange, fleeThreshold } = aiParameters;

    const distanceToPlayer = manhattanDistance(unit.getCoordinates(), playerUnit.getCoordinates());

    if (!canMove(speed, { state })) {
      return new StayOrder();
    } else if ((unit.getLife() / unit.getMaxLife()) < fleeThreshold) {
      return new AvoidUnitOrder({ targetUnit: playerUnit });
    } else if (distanceToPlayer <= visionRange) {
      if (unit.isInCombat()) {
        return new ShootUnitOrder({ targetUnit: playerUnit });
      } else if (randChance(aggressiveness)) {
        return new ShootUnitOrder({ targetUnit: playerUnit });
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