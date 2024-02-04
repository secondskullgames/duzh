import { UnitController, type UnitControllerContext } from './UnitController';
import Unit from '../Unit';
import { checkNotNull } from '../../../utils/preconditions';
import { isInStraightLine, manhattanDistance } from '../../../maps/MapUtils';
import UnitOrder from '../orders/UnitOrder';
import StayBehavior from '../behaviors/StayBehavior';
import { UnitBehavior } from '../behaviors/UnitBehavior';
import { hasUnblockedStraightLineBetween, pointAt } from '../../../utils/geometry';
import Direction from '../../../geometry/Direction';
import ShootUnitStationaryBehavior from '../behaviors/ShootUnitStationaryBehavior';
import { ShootTurretArrow } from '../abilities/ShootTurretArrow';
import MapInstance from '../../../maps/MapInstance';

export default class DragonShooterController implements UnitController {
  /**
   * @override {@link UnitController#issueOrder}
   */
  issueOrder = (unit: Unit, context: UnitControllerContext): UnitOrder => {
    const behavior = this._getBehavior(unit, context);
    return behavior.issueOrder(unit, context.state, context.session);
  };

  private _getBehavior = (
    unit: Unit,
    { session }: UnitControllerContext
  ): UnitBehavior => {
    const playerUnit = session.getPlayerUnit();
    if (this._canShoot(unit, playerUnit, session.getMap())) {
      return new ShootUnitStationaryBehavior({ targetUnit: playerUnit });
    } else {
      return new StayBehavior();
    }
  };

  private _canShoot = (unit: Unit, targetUnit: Unit, map: MapInstance): boolean => {
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
