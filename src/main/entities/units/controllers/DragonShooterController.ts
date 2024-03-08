import { UnitController } from './UnitController';
import Unit from '../Unit';
import UnitOrder from '../orders/UnitOrder';
import StayBehavior from '../behaviors/StayBehavior';
import { UnitBehavior } from '../behaviors/UnitBehavior';
import Direction from '../../../geometry/Direction';
import ShootUnitStationaryBehavior from '../behaviors/ShootUnitStationaryBehavior';
import { ShootTurretArrow } from '../abilities/ShootTurretArrow';
import MapInstance from '../../../maps/MapInstance';
import { checkNotNull } from '@lib/utils/preconditions';
import { GameState } from '@main/core/GameState';
import { Session } from '@main/core/Session';
import { hypotenuse, isInStraightLine, pointAt } from '@lib/geometry/CoordinatesUtils';
import { hasUnblockedStraightLineBetween } from '@main/maps/MapUtils';

export default class DragonShooterController implements UnitController {
  /**
   * @override {@link UnitController#issueOrder}
   */
  issueOrder = (unit: Unit, state: GameState, session: Session): UnitOrder => {
    const behavior = this._getBehavior(unit, session);
    return behavior.issueOrder(unit, state, session);
  };

  private _getBehavior = (unit: Unit, session: Session): UnitBehavior => {
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

    const distanceToTarget = hypotenuse(
      unit.getCoordinates(),
      targetUnit.getCoordinates()
    );

    if (
      unit.getMana() >= ShootTurretArrow.manaCost &&
      distanceToTarget <= visionRange &&
      isInStraightLine(unit.getCoordinates(), targetUnit.getCoordinates()) &&
      hasUnblockedStraightLineBetween(
        map,
        unit.getCoordinates(),
        targetUnit.getCoordinates()
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
