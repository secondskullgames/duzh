import Unit from '../Unit';
import { UnitController } from './UnitController';
import { checkNotNull } from '../../../utils/preconditions';
import { manhattanDistance } from '../../../maps/MapUtils';
import { canMove } from './ControllerUtils';
import { randBoolean, randChance } from '../../../utils/random';
import UnitOrder from '../orders/UnitOrder';
import AvoidUnitBehavior from '../behaviors/AvoidUnitBehavior';
import WanderBehavior from '../behaviors/WanderBehavior';
import StayBehavior from '../behaviors/StayBehavior';
import ShootUnitBehavior from '../behaviors/ShootUnitBehavior';
import { GlobalContext } from '../../../core/GlobalContext';

export default class ArcherController implements UnitController {
  /**
   * @override {@link UnitController#issueOrder}
   */
  issueOrder = (
    unit: Unit,
    context: GlobalContext
  ): UnitOrder => {
    const behavior = this._getBehavior(unit, context);
    return behavior.issueOrder(unit, context);
  }

  private _getBehavior = (unit: Unit, context: GlobalContext): UnitController => {
    const { state } = context;
    const playerUnit = state.getPlayerUnit();

    const aiParameters = checkNotNull(unit.getAiParameters(), 'ArcherController requires aiParams!');
    const { aggressiveness, speed, visionRange, fleeThreshold } = aiParameters;

    const distanceToPlayer = manhattanDistance(unit.getCoordinates(), playerUnit.getCoordinates());

    if (!canMove(speed, context)) {
      return new StayBehavior();
    } else if ((unit.getLife() / unit.getMaxLife()) < fleeThreshold) {
      return new AvoidUnitBehavior({ targetUnit: playerUnit });
    } else if (distanceToPlayer <= visionRange) {
      if (unit.isInCombat()) {
        return new ShootUnitBehavior({ targetUnit: playerUnit });
      } else if (randChance(aggressiveness)) {
        return new ShootUnitBehavior({ targetUnit: playerUnit });
      } else {
        return new WanderBehavior();
      }
    } else {
      if (randBoolean()) {
        return new StayBehavior();
      } else {
        return new WanderBehavior();
      }
    }
  }
};