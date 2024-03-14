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
import { getNearestEnemyUnit } from '@main/maps/MapUtils';

const _wantsToFlee = (unit: Unit) => {
  const aiParameters = checkNotNull(unit.getAiParameters());
  const { fleeThreshold } = aiParameters;
  return unit.getLife() / unit.getMaxLife() < fleeThreshold;
};

enum Action {
  ATTACK = 'ATTACK',
  FLEE = 'FLEE',
  STAY = 'STAY',
  WANDER = 'WANDER'
}

export default class BasicEnemyController implements UnitController {
  /**
   * @override {@link UnitController#issueOrder}
   */
  issueOrder = (unit: Unit, state: GameState, session: Session): UnitOrder => {
    const behavior = this._getBehavior(unit);
    return behavior.issueOrder(unit, state, session);
  };

  private _getBehavior = (unit: Unit): UnitBehavior => {
    const action = this._getAction(unit);
    switch (action) {
      case Action.ATTACK:
        return new AttackUnitBehavior({ targetUnit: this._getNearestEnemyUnit(unit) });
      case Action.FLEE:
        return new AvoidUnitBehavior({ targetUnit: this._getNearestEnemyUnit(unit) });
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
    const enemyUnit = this._getNearestEnemyUnit(unit);

    if (!canMove(unit)) {
      return Action.STAY;
    } else if (_wantsToFlee(unit)) {
      return Action.FLEE;
    } else if (canSee(unit, enemyUnit)) {
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

  private _getNearestEnemyUnit = (unit: Unit): Unit =>
    checkNotNull(getNearestEnemyUnit(unit.getMap(), unit));
}
