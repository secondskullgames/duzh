import { UnitController } from './UnitController';
import { UnitOrder } from '../orders/UnitOrder';
import { StayBehavior } from '../behaviors/StayBehavior';
import { UnitBehavior } from '../behaviors/UnitBehavior';
import { ShootUnitStationaryBehavior } from '../behaviors/ShootUnitStationaryBehavior';
import Unit from '@main/units/Unit';
import { hypotenuse, isInStraightLine } from '@duzh/geometry';
import { hasUnblockedStraightLineBetween } from '@main/maps/MapUtils';
import { randChance } from '@duzh/utils/random';
import { KnightMoveBehavior } from '@main/units/behaviors/KnightMoveBehavior';
import {
  getNearestEnemyUnit,
  isInVisionRange
} from '@main/units/controllers/ControllerUtils';
import { AbilityName } from '@main/abilities/AbilityName';

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
    if (unit.hasAbility(AbilityName.SHOOT_TURRET_ARROW)) {
      const ability = unit.getAbilityForName(AbilityName.SHOOT_TURRET_ARROW);
      return (
        unit.getMana() >= ability.manaCost &&
        isInVisionRange(unit, targetUnit) &&
        isInStraightLine(unit.getCoordinates(), targetUnit.getCoordinates()) &&
        hasUnblockedStraightLineBetween(
          unit.getMap(),
          unit.getCoordinates(),
          targetUnit.getCoordinates()
        )
      );
    }
    return false;
  };
}
