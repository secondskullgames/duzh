import { UnitController, type UnitControllerContext } from './UnitController';
import Unit from '../Unit';
import { checkNotNull } from '../../../utils/preconditions';
import { isInStraightLine, manhattanDistance } from '../../../maps/MapUtils';
import UnitOrder from '../orders/UnitOrder';
import StayBehavior from '../behaviors/StayBehavior';
import { UnitBehaviorContext } from '../behaviors/UnitBehavior';
import { hasUnblockedStraightLineBetween, pointAt } from '../../../utils/geometry';
import Direction from '../../../geometry/Direction';
import ShootUnitStationaryBehavior from '../behaviors/ShootUnitStationaryBehavior';
import { ShootTurretArrow } from '../abilities/ShootTurretArrow';

export default class DragonShooterController implements UnitController {
  /**
   * @override {@link UnitController#issueOrder}
   */
  issueOrder = (unit: Unit, { state, map }: UnitControllerContext): UnitOrder => {
    const behavior = this._getBehavior(unit, { state, map });
    return behavior.issueOrder(unit, { state, map });
  };

  private _getBehavior = (
    unit: Unit,
    { state }: UnitControllerContext
  ): UnitController => {
    const playerUnit = state.getPlayerUnit();
    if (this._canShoot(unit, playerUnit, { map: state.getMap() })) {
      return new ShootUnitStationaryBehavior({ targetUnit: playerUnit });
    } else {
      return new StayBehavior();
    }
  };

  private _canShoot = (
    unit: Unit,
    targetUnit: Unit,
    { map }: Pick<UnitBehaviorContext, 'map'>
  ): boolean => {
    const aiParameters = checkNotNull(
      unit.getAiParameters(),
      'DragonShooterController requires aiParams!'
    );

    const { visionRange } = aiParameters;

    const distanceToTarget = manhattanDistance(
      unit.getCoordinates(),
      targetUnit.getCoordinates()
    );

    if (
      unit.getMana() >= ShootTurretArrow.manaCost &&
      distanceToTarget <= visionRange &&
      isInStraightLine(unit.getCoordinates(), targetUnit.getCoordinates()) &&
      hasUnblockedStraightLineBetween(
        unit.getCoordinates(),
        targetUnit.getCoordinates(),
        { map }
      )
    ) {
      const direction = pointAt(unit.getCoordinates(), targetUnit.getCoordinates());
      return (
        Direction.equals(direction, Direction.W) ||
        Direction.equals(direction, Direction.E)
      );
    }

    return false;
  };
}
