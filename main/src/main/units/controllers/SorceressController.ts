import { UnitController } from './UnitController';
import { UnitOrder } from '../orders/UnitOrder';
import { UnitBehavior } from '../behaviors/UnitBehavior';
import { ShootUnitStationaryBehavior } from '../behaviors/ShootUnitStationaryBehavior';
import Unit from '@main/units/Unit';
import { isInStraightLine } from '@lib/geometry/CoordinatesUtils';
import { hasUnblockedStraightLineBetween } from '@main/maps/MapUtils';
import { randChance } from '@duzh/utils/random';
import { KnightMoveBehavior } from '@main/units/behaviors/KnightMoveBehavior';
import { AvoidNearestEnemyBehavior } from '@main/units/behaviors/AvoidNearestEnemyBehavior';
import { WanderBehavior } from '@main/units/behaviors/WanderBehavior';
import { AbilityName } from '@main/abilities/AbilityName';
import {
  getNearestEnemyUnit,
  isInVisionRange
} from '@main/units/controllers/ControllerUtils';
import { StayBehavior } from '@main/units/behaviors/StayBehavior';

const teleportChance = 0.2;
const shootChance = 0.5;

export class SorceressController implements UnitController {
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
    const canTeleport = this._canTeleport(unit);
    const _isInVisionRange = isInVisionRange(unit, nearestEnemyUnit);
    const wantsToTeleport = _isInVisionRange && randChance(teleportChance);
    const canShoot = this._canShoot(unit, nearestEnemyUnit);
    const wantsToShoot = randChance(shootChance);

    if (canShoot && wantsToShoot) {
      return new ShootUnitStationaryBehavior();
    } else if (canTeleport && wantsToTeleport) {
      return new KnightMoveBehavior();
    } else if (_isInVisionRange) {
      return new AvoidNearestEnemyBehavior();
    } else {
      return new WanderBehavior();
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

  private _canTeleport = (unit: Unit) => {
    if (unit.hasAbility(AbilityName.FAST_TELEPORT)) {
      const ability = unit.getAbilityForName(AbilityName.FAST_TELEPORT);
      return unit.getMana() >= ability.manaCost;
    }
  };
}
