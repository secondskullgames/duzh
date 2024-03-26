import { UnitController } from './UnitController';
import { canMove, getNearestEnemyUnit } from './ControllerUtils';
import UnitOrder from '../orders/UnitOrder';
import AvoidUnitBehavior from '../behaviors/AvoidUnitBehavior';
import WanderBehavior from '../behaviors/WanderBehavior';
import StayBehavior from '../behaviors/StayBehavior';
import ShootUnitBehavior from '../behaviors/ShootUnitBehavior';
import { UnitBehavior } from '../behaviors/UnitBehavior';
import Unit from '@main/units/Unit';
import { randBoolean, randChance } from '@lib/utils/random';
import { checkNotNull } from '@lib/utils/preconditions';
import { hypotenuse } from '@lib/geometry/CoordinatesUtils';

export default class ArcherController implements UnitController {
  /**
   * @override {@link UnitController#issueOrder}
   */
  issueOrder = (unit: Unit): UnitOrder => {
    const behavior = this._getBehavior(unit);
    return behavior.issueOrder(unit);
  };

  private _getBehavior = (unit: Unit): UnitBehavior => {
    const nearestEnemyUnit = getNearestEnemyUnit(unit);
    if (!nearestEnemyUnit) {
      return new StayBehavior();
    }

    const aiParameters = checkNotNull(
      unit.getAiParameters(),
      'ArcherController requires aiParams!'
    );
    const { aggressiveness, visionRange, fleeThreshold } = aiParameters;

    const distanceToPlayer = hypotenuse(
      unit.getCoordinates(),
      nearestEnemyUnit.getCoordinates()
    );

    if (!canMove(unit)) {
      return new StayBehavior();
    } else if (unit.getLife() / unit.getMaxLife() < fleeThreshold) {
      return new AvoidUnitBehavior({ targetUnit: nearestEnemyUnit });
    } else if (distanceToPlayer <= visionRange) {
      if (unit.isInCombat()) {
        return new ShootUnitBehavior({ targetUnit: nearestEnemyUnit });
      } else if (randChance(aggressiveness)) {
        return new ShootUnitBehavior({ targetUnit: nearestEnemyUnit });
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
  };
}
