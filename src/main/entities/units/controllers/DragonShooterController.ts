import { UnitController } from './UnitController';
import StayBehavior from '../behaviors/StayBehavior';
import { UnitBehavior } from '../behaviors/UnitBehavior';
import ShootUnitStationaryBehavior from '../behaviors/ShootUnitStationaryBehavior';
import MapInstance from '../../../maps/MapInstance';
import { hasUnblockedStraightLineBetween } from '@main/utils/geometry';
import { checkNotNull } from '@main/utils/preconditions';
import { GameState, Session } from '@main/core';
import { hypotenuse, isInStraightLine, pointAt, Direction } from '@main/geometry';
import { Unit } from '@main/entities/units';
import { UnitOrder } from '@main/entities/units/orders';
import { ShootTurretArrow } from '@main/entities/units/abilities';

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
        unit.getCoordinates(),
        targetUnit.getCoordinates(),
        map
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
