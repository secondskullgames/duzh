import { UnitController } from './UnitController';
import { canMove } from './ControllerUtils';
import { randBoolean, randChance } from '@main/utils/random';
import { checkNotNull } from '@main/utils/preconditions';
import { Session, GameState } from '@main/core';
import { hypotenuse } from '@main/geometry';
import { Unit } from '@main/entities/units';
import { UnitOrder } from '@main/entities/units/orders';
import {
  AvoidUnitBehavior,
  StayBehavior,
  UnitBehavior,
  WanderBehavior,
  ShootUnitBehavior
} from '@main/entities/units/behaviors';

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
