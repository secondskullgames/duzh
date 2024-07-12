import { UnitController } from './UnitController';
import { UnitOrder } from '../orders/UnitOrder';
import { StayBehavior } from '../behaviors/StayBehavior';
import { UnitBehavior } from '../behaviors/UnitBehavior';
import { ShootUnitStationaryBehavior } from '../behaviors/ShootUnitStationaryBehavior';
import { ShootTurretArrow } from '@main/abilities/ShootTurretArrow';
import Unit from '@main/units/Unit';
import { hypotenuse, isInStraightLine } from '@lib/geometry/CoordinatesUtils';
import { hasUnblockedStraightLineBetween } from '@main/maps/MapUtils';
import { randChance } from '@lib/utils/random';
import { KnightMoveBehavior } from '@main/units/behaviors/KnightMoveBehavior';
import {
  getNearestEnemyUnit,
  isInVisionRange
} from '@main/units/controllers/ControllerUtils';

const teleportChance = 0.25;
const shootChance = 0.9;

export default class DragonShooterController implements UnitController {
  /**
   * @override {@link UnitController#issueOrder}
   */
  issueOrder = (unit: Unit): UnitOrder => {
    const behavior = this._getBehavior(unit);
    return behavior.issueOrder(unit);
  };

  private _getBehavior = (unit: Unit): UnitBehavior => {
    const nearestEnemyUnit = getNearestEnemyUnit(unit);
    if (!nearestEnemyUnit) {
      return new StayBehavior();
    }
    const distanceToNearestEnemy = hypotenuse(
      unit.getCoordinates(),
      nearestEnemyUnit.getCoordinates()
    );
    const wantsToTeleport = distanceToNearestEnemy <= 2 || randChance(teleportChance);
    const canShoot = this._canShoot(unit, nearestEnemyUnit);
    const wantsToShoot = randChance(shootChance);

    if (wantsToTeleport) {
      return new KnightMoveBehavior();
    } else if (canShoot && wantsToShoot) {
      return new ShootUnitStationaryBehavior();
    } else {
      return new StayBehavior();
    }
  };

  private _canShoot = (unit: Unit, targetUnit: Unit): boolean => {
    return (
      unit.getMana() >= ShootTurretArrow.manaCost &&
      isInVisionRange(unit, targetUnit) &&
      isInStraightLine(unit.getCoordinates(), targetUnit.getCoordinates()) &&
      hasUnblockedStraightLineBetween(
        unit.getMap(),
        unit.getCoordinates(),
        targetUnit.getCoordinates()
      )
    );
  };
}
