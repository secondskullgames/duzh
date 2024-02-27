import { UnitController } from './UnitController';
import { canMove } from './ControllerUtils';
import Unit from '../Unit';
import UnitOrder from '../orders/UnitOrder';
import AvoidUnitBehavior from '../behaviors/AvoidUnitBehavior';
import WanderBehavior from '../behaviors/WanderBehavior';
import StayBehavior from '../behaviors/StayBehavior';
import ShootUnitBehavior from '../behaviors/ShootUnitBehavior';
import { UnitBehavior } from '../behaviors/UnitBehavior';
import { randBoolean, randChance } from '@main/utils/random';
import { checkNotNull } from '@main/utils/preconditions';
import { Session } from '@main/core/Session';
import { GameState } from '@main/core/GameState';
import { hypotenuse } from '@main/geometry';

export default class ArcherController implements UnitController {
  /**
   * @override {@link UnitController#issueOrder}
   */
  issueOrder = (unit: Unit, state: GameState, session: Session): UnitOrder => {
    const behavior = this._getBehavior(unit, session);
    return behavior.issueOrder(unit, state, session);
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
  };
}
