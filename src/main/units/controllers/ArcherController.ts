import { UnitController } from './UnitController';
import { canMove } from './ControllerUtils';
import { UnitOrder } from '../orders/UnitOrder';
import AvoidNearestEnemyBehavior from '../behaviors/AvoidNearestEnemyBehavior';
import WanderBehavior from '../behaviors/WanderBehavior';
import StayBehavior from '../behaviors/StayBehavior';
import ShootNearestEnemyBehavior from '../behaviors/ShootNearestEnemyBehavior';
import { UnitBehavior } from '../behaviors/UnitBehavior';
import Unit from '@main/units/Unit';
import { randBoolean, randChance } from '@lib/utils/random';
import { checkNotNull } from '@lib/utils/preconditions';
import { Session } from '@main/core/Session';
import { GameState } from '@main/core/GameState';
import { hypotenuse } from '@lib/geometry/CoordinatesUtils';

export default class ArcherController implements UnitController {
  /**
   * @override {@link UnitController#issueOrder}
   */
  issueOrder = (unit: Unit, state: GameState, session: Session): UnitOrder => {
    const behavior = this._getBehavior(unit, session);
    return behavior.issueOrder(unit);
  };

  private _getBehavior = (unit: Unit, session: Session): UnitBehavior => {
    const playerUnit = session.getPlayerUnit();

    const aiParameters = checkNotNull(
      unit.getAiParameters(),
      'ArcherController requires aiParams!'
    );
    const { aggressiveness, visionRange, fleeThreshold } = aiParameters;

    const distanceToPlayer = hypotenuse(
      unit.getCoordinates(),
      playerUnit.getCoordinates()
    );

    if (!canMove(unit)) {
      return new StayBehavior();
    } else if (unit.getLife() / unit.getMaxLife() < fleeThreshold) {
      return new AvoidNearestEnemyBehavior();
    } else if (distanceToPlayer <= visionRange) {
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
