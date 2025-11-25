import { UnitBehavior } from './UnitBehavior';
import { UnitOrder } from '../orders/UnitOrder';
import { AbilityOrder } from '../orders/AbilityOrder';
import { StayOrder } from '../orders/StayOrder';
import { AbilityName } from '@main/abilities/AbilityName';
import Unit from '@main/units/Unit';
import { isInStraightLine, pointAt } from '@duzh/geometry';
import { hasUnblockedStraightLineBetween } from '@main/maps/MapUtils';
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
      const ability = unit.getAbilityForName(AbilityName.SHOOT_TURRET_ARROW);
      return AbilityOrder.create({ direction, ability });
    }

    return StayOrder.create();
  };

  private _canShoot = (unit: Unit, targetUnit: Unit): boolean => {
    const ability = unit.getAbilityForName(AbilityName.SHOOT_TURRET_ARROW);
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
