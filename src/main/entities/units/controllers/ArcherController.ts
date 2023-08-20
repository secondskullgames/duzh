import Unit from '../Unit';
import { UnitController, type UnitControllerContext } from './UnitController';
import { checkNotNull } from '../../../utils/preconditions';
import { manhattanDistance } from '../../../maps/MapUtils';
import { canMove } from './ControllerUtils';
import { randBoolean, randChance } from '../../../utils/random';
import UnitOrder from '../orders/UnitOrder';
import AvoidUnitBehavior from '../behaviors/AvoidUnitBehavior';
import WanderBehavior from '../behaviors/WanderBehavior';
import StayBehavior from '../behaviors/StayBehavior';
import ShootUnitBehavior from '../behaviors/ShootUnitBehavior';

export default class ArcherController implements UnitController {
  /**
   * @override {@link UnitController#issueOrder}
   */
  issueOrder = (
    unit: Unit,
    { game, map }: UnitControllerContext
  ): UnitOrder => {
    const behavior = this._getBehavior(unit, { game: game, map });
    return behavior.issueOrder(unit, { game: game, map });
  }

  private _getBehavior = (
    unit: Unit,
    { game, map }: UnitControllerContext
  ): UnitController => {
    const playerUnit = game.getPlayerUnit();

    const aiParameters = checkNotNull(unit.getAiParameters(), 'ArcherController requires aiParams!');
    const { aggressiveness, speed, visionRange, fleeThreshold } = aiParameters;

    const distanceToPlayer = manhattanDistance(unit.getCoordinates(), playerUnit.getCoordinates());

    if (!canMove(speed, { game: game })) {
      return new StayBehavior();
    } else if ((unit.getLife() / unit.getMaxLife()) < fleeThreshold) {
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
  }
};