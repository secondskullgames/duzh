import { UnitController } from './UnitController';
import { canMove, canSee, getNearestEnemyUnit } from './ControllerUtils';
import { UnitOrder } from '../orders/UnitOrder';
import AvoidNearestEnemyBehavior from '../behaviors/AvoidNearestEnemyBehavior';
import AttackNearestEnemyBehavior from '../behaviors/AttackNearestEnemyBehavior';
import WanderBehavior from '../behaviors/WanderBehavior';
import Unit from '@main/units/Unit';
import { randBoolean, randChance } from '@lib/utils/random';
import { checkNotNull } from '@lib/utils/preconditions';
import { GameState } from '@main/core/GameState';
import { Session } from '@main/core/Session';
import { UnitBehavior } from '@main/units/behaviors/UnitBehavior';
import StayBehavior from '@main/units/behaviors/StayBehavior';

enum Action {
  ATTACK = 'ATTACK',
  FLEE = 'FLEE',
  STAY = 'STAY',
  WANDER = 'WANDER'
}

export default class BasicEnemyController implements UnitController {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  issueOrder = (unit: Unit, state: GameState, session: Session): UnitOrder => {
    const behavior = this._getBehavior(unit);
    return behavior.issueOrder(unit);
  };

  private _getBehavior = (unit: Unit): UnitBehavior => {
    const action = this._getAction(unit);
    switch (action) {
      case Action.ATTACK:
        return new AttackNearestEnemyBehavior();
      case Action.FLEE:
        return new AvoidNearestEnemyBehavior();
      case Action.STAY:
        return new StayBehavior();
      case Action.WANDER:
        return new WanderBehavior();
    }
  };

  private _getAction = (unit: Unit): Action => {
    const aiParameters = checkNotNull(
      unit.getAiParameters(),
      'BasicEnemyController requires aiParams!'
    );
    const { aggressiveness } = aiParameters;
    const enemyUnit = getNearestEnemyUnit(unit);

    if (!canMove(unit)) {
      return Action.STAY;
    } else if (_wantsToFlee(unit)) {
      return Action.FLEE;
    } else if (enemyUnit && canSee(unit, enemyUnit)) {
      if (unit.isInCombat()) {
        return Action.ATTACK;
      } else if (randChance(aggressiveness)) {
        return Action.ATTACK;
      } else {
        return Action.WANDER;
      }
    } else {
      if (randBoolean()) {
        return Action.STAY;
      } else {
        return Action.WANDER;
      }
    }
  };
}

const _wantsToFlee = (unit: Unit) => {
  const aiParameters = checkNotNull(unit.getAiParameters());
  const { fleeThreshold } = aiParameters;
  return unit.getLife() / unit.getMaxLife() < fleeThreshold;
};
