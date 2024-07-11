import { UnitController } from './UnitController';
import { canMove, getNearestEnemyUnit, isInVisionRange } from './ControllerUtils';
import { UnitOrder } from '../orders/UnitOrder';
import AvoidNearestEnemyBehavior from '../behaviors/AvoidNearestEnemyBehavior';
import WanderBehavior from '../behaviors/WanderBehavior';
import StayBehavior from '../behaviors/StayBehavior';
import ShootNearestEnemyBehavior from '../behaviors/ShootNearestEnemyBehavior';
import { UnitBehavior } from '../behaviors/UnitBehavior';
import Unit from '@main/units/Unit';
import { randBoolean, randChance } from '@lib/utils/random';
import { checkNotNull } from '@lib/utils/preconditions';

export default class ArcherController implements UnitController {
  /**
   * @override {@link UnitController#issueOrder}
   */
  issueOrder = (unit: Unit): UnitOrder => {
    const behavior = this._getBehavior(unit);
    return behavior.issueOrder(unit);
  };

  private _getBehavior = (unit: Unit): UnitBehavior => {
    const targetUnit = getNearestEnemyUnit(unit);
    if (!targetUnit) {
      return new StayBehavior();
    }

    const aiParameters = checkNotNull(
      unit.getAiParameters(),
      'ArcherController requires aiParams!'
    );
    const { aggressiveness, fleeThreshold } = aiParameters;

    if (!canMove(unit)) {
      return new StayBehavior();
    } else if (unit.getLife() / unit.getMaxLife() < fleeThreshold) {
      return new AvoidNearestEnemyBehavior();
    } else if (isInVisionRange(unit, targetUnit)) {
      if (unit.isInCombat()) {
        return new ShootNearestEnemyBehavior();
      } else if (randChance(aggressiveness)) {
        return new ShootNearestEnemyBehavior();
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
