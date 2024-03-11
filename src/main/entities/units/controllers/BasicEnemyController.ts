import { UnitController } from './UnitController';
import { canMove, canSee } from './ControllerUtils';
import Unit from '../Unit';
import UnitOrder from '../orders/UnitOrder';
import AvoidUnitBehavior from '../behaviors/AvoidUnitBehavior';
import AttackUnitBehavior from '../behaviors/AttackUnitBehavior';
import WanderBehavior from '../behaviors/WanderBehavior';
import { randBoolean, randChance } from '@lib/utils/random';
import { checkNotNull } from '@lib/utils/preconditions';
import { GameState } from '@main/core/GameState';
import { Session } from '@main/core/Session';
import { UnitBehavior } from '@main/entities/units/behaviors/UnitBehavior';
import StayBehavior from '@main/entities/units/behaviors/StayBehavior';

const _wantsToFlee = (unit: Unit) => {
  const aiParameters = checkNotNull(unit.getAiParameters());
  const { fleeThreshold } = aiParameters;
  return unit.getLife() / unit.getMaxLife() < fleeThreshold;
};

export default class BasicEnemyController implements UnitController {
  /**
   * @override {@link UnitController#issueOrder}
   */
  issueOrder = (unit: Unit, state: GameState, session: Session): UnitOrder => {
    const behavior = this._getBehavior(unit, state, session);
    return behavior.issueOrder(unit, state, session);
  };

  private _getBehavior = (
    unit: Unit,
    state: GameState,
    session: Session
  ): UnitBehavior => {
    const aiParameters = checkNotNull(
      unit.getAiParameters(),
      'BasicEnemyController requires aiParams!'
    );
    const { aggressiveness } = aiParameters;
    const enemyUnit = session.getPlayerUnit();

    if (!canMove(unit)) {
      return new StayBehavior();
    } else if (_wantsToFlee(unit)) {
      return new AvoidUnitBehavior({ targetUnit: enemyUnit });
    } else if (canSee(unit, enemyUnit)) {
      if (unit.isInCombat()) {
        return new AttackUnitBehavior({ targetUnit: enemyUnit });
      } else if (randChance(aggressiveness)) {
        return new AttackUnitBehavior({ targetUnit: enemyUnit });
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
