import { UnitController } from './UnitController';
import Unit from '../Unit';
import { checkNotNull } from '../../../utils/preconditions';
import { manhattanDistance } from '../../../maps/MapUtils';
import { canMove } from './ControllerUtils';
import { randBoolean, randChance } from '../../../utils/random';
import StayOrder from '../orders/StayOrder';
import UnitOrder from '../orders/UnitOrder';
import AvoidUnitBehavior from '../behaviors/AvoidUnitBehavior';
import AttackUnitBehavior from '../behaviors/AttackUnitBehavior';
import WanderBehavior from '../behaviors/WanderBehavior';
import { GlobalContext } from '../../../core/GlobalContext';

export default class BasicEnemyController implements UnitController {
  /**
   * @override {@link UnitController#issueOrder}
   */
  issueOrder = (
    unit: Unit,
    context: GlobalContext
  ): UnitOrder => {
    const { state } = context;
    const playerUnit = state.getPlayerUnit();

    const aiParameters = checkNotNull(unit.getAiParameters(), 'HumanRedesignController requires aiParams!');
    const { aggressiveness, speed, visionRange, fleeThreshold } = aiParameters;

    const distanceToPlayer = manhattanDistance(unit.getCoordinates(), playerUnit.getCoordinates());

    if (!canMove(speed, context)) {
      return new StayOrder();
    } else if ((unit.getLife() / unit.getMaxLife()) < fleeThreshold) {
      return new AvoidUnitBehavior({ targetUnit: playerUnit })
        .issueOrder(unit, { state });
    } else if (distanceToPlayer <= visionRange) {
      if (unit.isInCombat()) {
        return new AttackUnitBehavior({ targetUnit: playerUnit })
          .issueOrder(unit, { state });
      } else if (randChance(aggressiveness)) {
        return new AttackUnitBehavior({ targetUnit: playerUnit })
          .issueOrder(unit, { state });
      } else {
        return new WanderBehavior()
          .issueOrder(unit, { state });
      }
    } else {
      if (randBoolean()) {
        return new StayOrder();
      } else {
        return new WanderBehavior()
          .issueOrder(unit, { state });
      }
    }
  }
};