import { UnitController } from './UnitController';
import { UnitOrder } from '../orders/UnitOrder';
import { UnitBehavior } from '../behaviors/UnitBehavior';
import ShootUnitStationaryBehavior from '../behaviors/ShootUnitStationaryBehavior';
import { ShootTurretArrow } from '@main/abilities/ShootTurretArrow';
import Unit from '@main/units/Unit';
import { isInStraightLine } from '@lib/geometry/CoordinatesUtils';
import { hasUnblockedStraightLineBetween } from '@main/maps/MapUtils';
import { randChance } from '@lib/utils/random';
import KnightMoveBehavior from '@main/units/behaviors/KnightMoveBehavior';
import AvoidNearestEnemyBehavior from '@main/units/behaviors/AvoidNearestEnemyBehavior';
import WanderBehavior from '@main/units/behaviors/WanderBehavior';
import { FastTeleport } from '@main/abilities/FastTeleport';
import { AbilityName } from '@main/abilities/AbilityName';
import {
  getNearestEnemyUnit,
  isInVisionRange
} from '@main/units/controllers/ControllerUtils';
import StayBehavior from '@main/units/behaviors/StayBehavior';

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
    const canTeleport =
      unit.hasAbility(AbilityName.FAST_TELEPORT) &&
      unit.getMana() >= FastTeleport.manaCost;
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
