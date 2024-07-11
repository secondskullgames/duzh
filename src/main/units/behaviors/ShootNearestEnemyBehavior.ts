import AttackNearestEnemyBehavior from './AttackNearestEnemyBehavior';
import { UnitBehavior } from './UnitBehavior';
import { UnitOrder } from '../orders/UnitOrder';
import { AbilityOrder } from '../orders/AbilityOrder';
import { ShootArrow } from '@main/abilities/ShootArrow';
import { AbilityName } from '@main/abilities/AbilityName';
import Unit from '@main/units/Unit';
import {
  pointAt,
  manhattanDistance,
  isInStraightLine,
  hypotenuse
} from '@lib/geometry/CoordinatesUtils';
import { hasUnblockedStraightLineBetween } from '@main/maps/MapUtils';
import { EquipmentSlot } from '@models/EquipmentSlot';
import { UnitAbility } from '@main/abilities/UnitAbility';
import { getNearestEnemyUnit } from '@main/units/controllers/ControllerUtils';
import { StayOrder } from '@main/units/orders/StayOrder';
import { checkNotNull } from '@lib/utils/preconditions';

export default class ShootNearestEnemyBehavior implements UnitBehavior {
  /** @override {@link UnitBehavior#issueOrder} */
  issueOrder = (unit: Unit): UnitOrder => {
    const targetUnit = getNearestEnemyUnit(unit);
    if (!targetUnit) {
      return StayOrder.create();
    }

    const visionRange = checkNotNull(unit.getAiParameters()).visionRange;
    if (hypotenuse(unit.getCoordinates(), targetUnit.getCoordinates()) > visionRange) {
      return StayOrder.create();
    }

    const atLeastOneTileAway =
      manhattanDistance(unit.getCoordinates(), targetUnit.getCoordinates()) > 1;
    if (atLeastOneTileAway && canShoot(unit, targetUnit)) {
      const direction = pointAt(unit.getCoordinates(), targetUnit.getCoordinates());
      return AbilityOrder.create({ direction, ability: ShootArrow });
    }

    // TODO - instantiating this here is a hack
    // and now, it no longer makes sense.  Oh well
    return new AttackNearestEnemyBehavior().issueOrder(unit);
  };
}

const canShoot = (unit: Unit, targetUnit: Unit): boolean => {
  const ability = UnitAbility.abilityForName(AbilityName.SHOOT_ARROW);
  return (
    unit.getEquipment().getBySlot(EquipmentSlot.RANGED_WEAPON) !== null &&
    unit.getMana() >= ability.manaCost &&
    isInStraightLine(unit.getCoordinates(), targetUnit.getCoordinates()) &&
    hasUnblockedStraightLineBetween(
      unit.getMap(),
      unit.getCoordinates(),
      targetUnit.getCoordinates()
    )
  );
};
