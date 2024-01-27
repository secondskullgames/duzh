import { UnitController, type UnitControllerContext } from './UnitController';
import { canMove } from './ControllerUtils';
import Unit from '../Unit';
import { checkNotNull } from '../../../utils/preconditions';
import { manhattanDistance } from '../../../maps/MapUtils';
import { randBoolean, randChance } from '../../../utils/random';
import StayOrder from '../orders/StayOrder';
import UnitOrder from '../orders/UnitOrder';
import AvoidUnitBehavior from '../behaviors/AvoidUnitBehavior';
import AttackUnitBehavior from '../behaviors/AttackUnitBehavior';
import WanderBehavior from '../behaviors/WanderBehavior';

export default class BasicEnemyController implements UnitController {
  /**
   * @override {@link UnitController#issueOrder}
   */
  issueOrder = (
    unit: Unit,
    { state, map, session }: UnitControllerContext
  ): UnitOrder => {
    const playerUnit = session.getPlayerUnit();

    const aiParameters = checkNotNull(
      unit.getAiParameters(),
      'BasicEnemyController requires aiParams!'
    );
    const { aggressiveness, speed, visionRange, fleeThreshold } = aiParameters;

    const distanceToPlayer = manhattanDistance(
      unit.getCoordinates(),
      playerUnit.getCoordinates()
    );

    if (!canMove(speed, session)) {
      return new StayOrder();
    } else if (unit.getLife() / unit.getMaxLife() < fleeThreshold) {
      return new AvoidUnitBehavior({ targetUnit: playerUnit }).issueOrder(unit, {
        state,
        map
      });
    } else if (distanceToPlayer <= visionRange) {
      if (unit.isInCombat()) {
        return new AttackUnitBehavior({ targetUnit: playerUnit }).issueOrder(unit, {
          state,
          map
        });
      } else if (randChance(aggressiveness)) {
        return new AttackUnitBehavior({ targetUnit: playerUnit }).issueOrder(unit, {
          state,
          map
        });
      } else {
        return new WanderBehavior().issueOrder(unit, { state, map });
      }
    } else {
      if (randBoolean()) {
        return new StayOrder();
      } else {
        return new WanderBehavior().issueOrder(unit, { state, map });
      }
    }
  };
}
