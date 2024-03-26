import AttackUnitBehavior from './AttackUnitBehavior';
import { UnitBehavior } from './UnitBehavior';
import UnitOrder from '../orders/UnitOrder';
import { AbilityOrder } from '../orders/AbilityOrder';
import { ShootArrow } from '@main/abilities/ShootArrow';
import { AbilityName } from '@main/abilities/AbilityName';
import Unit from '@main/units/Unit';
import {
  isInStraightLine,
  manhattanDistance,
  pointAt
} from '@lib/geometry/CoordinatesUtils';
import { hasUnblockedStraightLineBetween } from '@main/maps/MapUtils';
import { EquipmentSlot } from '@models/EquipmentSlot';
import { UnitAbility } from '@main/abilities/UnitAbility';

type Props = Readonly<{
  targetUnit: Unit;
}>;

export default class ShootUnitBehavior implements UnitBehavior {
  private readonly targetUnit: Unit;

  constructor({ targetUnit }: Props) {
    this.targetUnit = targetUnit;
  }

  /** @override {@link UnitBehavior#issueOrder} */
  issueOrder = (unit: Unit): UnitOrder => {
    const { targetUnit } = this;

    const atLeastOneTileAway =
      manhattanDistance(unit.getCoordinates(), targetUnit.getCoordinates()) > 1;
    if (atLeastOneTileAway && canShoot(unit, targetUnit)) {
      const direction = pointAt(unit.getCoordinates(), targetUnit.getCoordinates());
      return new AbilityOrder({ direction, ability: ShootArrow });
    }

    const behavior = new AttackUnitBehavior({ targetUnit });
    return behavior.issueOrder(unit);
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
