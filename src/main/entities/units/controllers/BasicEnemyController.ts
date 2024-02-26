import { UnitController } from './UnitController';
import { canMove, canSee } from './ControllerUtils';
import Unit from '../Unit';
import { checkNotNull } from '../../../utils/preconditions';
import { randBoolean, randChance } from '../../../utils/random';
import StayOrder from '../orders/StayOrder';
import UnitOrder from '../orders/UnitOrder';
import AvoidUnitBehavior from '../behaviors/AvoidUnitBehavior';
import AttackUnitBehavior from '../behaviors/AttackUnitBehavior';
import WanderBehavior from '../behaviors/WanderBehavior';
import { GameState } from '../../../core/GameState';
import { Session } from '../../../core/Session';

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
    const enemyUnit = session.getPlayerUnit();

    const aiParameters = checkNotNull(
      unit.getAiParameters(),
      'BasicEnemyController requires aiParams!'
    );
    const { aggressiveness } = aiParameters;

    if (!canMove(unit)) {
      return new StayOrder();
    } else if (_wantsToFlee(unit)) {
      return new AvoidUnitBehavior({ targetUnit: enemyUnit }).issueOrder(
        unit,
        state,
        session
      );
    } else if (canSee(unit, enemyUnit)) {
      if (unit.isInCombat()) {
        return new AttackUnitBehavior({ targetUnit: enemyUnit }).issueOrder(
          unit,
          state,
          session
        );
      } else if (randChance(aggressiveness)) {
        return new AttackUnitBehavior({ targetUnit: enemyUnit }).issueOrder(
          unit,
          state,
          session
        );
      } else {
        return new WanderBehavior().issueOrder(unit, state, session);
      }
    } else {
      if (randBoolean()) {
        return new StayOrder();
      } else {
        return new WanderBehavior().issueOrder(unit, state, session);
      }
    }
  };
}
