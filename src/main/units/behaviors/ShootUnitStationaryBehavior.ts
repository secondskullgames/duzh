import { UnitBehavior } from './UnitBehavior';
import { UnitOrder } from '../orders/UnitOrder';
import { AbilityOrder } from '../orders/AbilityOrder';
import { StayOrder } from '../orders/StayOrder';
import { ShootTurretArrow } from '@main/abilities/ShootTurretArrow';
import { AbilityName } from '@main/abilities/AbilityName';
import Unit from '@main/units/Unit';
import { isInStraightLine, pointAt } from '@lib/geometry/CoordinatesUtils';
import { hasUnblockedStraightLineBetween } from '@main/maps/MapUtils';
import { UnitAbility } from '@main/abilities/UnitAbility';
import {
  getNearestEnemyUnit,
  isInVisionRange
} from '@main/units/controllers/ControllerUtils';

export class ShootUnitStationaryBehavior implements UnitBehavior {
  /** @override {@link UnitBehavior#issueOrder} */
  issueOrder = (unit: Unit): UnitOrder => {
    const targetUnit = getNearestEnemyUnit(unit);
    if (!targetUnit) {
      return StayOrder.create();
    }

    // TODO check vision

    const canShoot = this._canShoot(unit, targetUnit);
    if (canShoot) {
      const direction = pointAt(unit.getCoordinates(), targetUnit.getCoordinates());
      return AbilityOrder.create({
        direction,
        ability: ShootTurretArrow
      });
    }

    return StayOrder.create();
  };

  _canShoot = (unit: Unit, targetUnit: Unit): boolean => {
    const ability = UnitAbility.abilityForName(AbilityName.SHOOT_TURRET_ARROW);
    return (
      unit.getMana() >= ability.manaCost &&
      isInStraightLine(unit.getCoordinates(), targetUnit.getCoordinates()) &&
      isInVisionRange(unit, targetUnit) &&
      hasUnblockedStraightLineBetween(
        unit.getMap(),
        unit.getCoordinates(),
        targetUnit.getCoordinates()
      )
    );
  };
}
