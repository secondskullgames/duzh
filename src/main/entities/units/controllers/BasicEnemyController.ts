import { UnitController } from './UnitController';
import { canMove, canSee } from './ControllerUtils';
import { randBoolean, randChance } from '@main/utils/random';
import { checkNotNull } from '@main/utils/preconditions';
import { GameState, Session } from '@main/core';
import { Unit } from '@main/entities/units';
import { StayOrder, UnitOrder } from '@main/entities/units/orders';
import {
  AttackUnitBehavior,
  AvoidUnitBehavior,
  WanderBehavior
} from '@main/entities/units/behaviors';

const _wantsToFlee = (unit: Unit) => {
  const aiParameters = checkNotNull(unit.getAiParameters());
  const { fleeThreshold } = aiParameters;
  return unit.getLife() / unit.getMaxLife() < fleeThreshold;
};

export class BasicEnemyController implements UnitController {
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
