import AttackUnitBehavior from './AttackUnitBehavior';
import { UnitBehavior } from './UnitBehavior';
import Unit from '../Unit';
import UnitOrder from '../orders/UnitOrder';
import { ShootArrow } from '../abilities/ShootArrow';
import { AbilityOrder } from '../orders/AbilityOrder';
import { AbilityName } from '../abilities/AbilityName';
import {
  pointAt,
  manhattanDistance,
  isInStraightLine
} from '@lib/geometry/CoordinatesUtils';
import { GameState } from '@main/core/GameState';
import { Session } from '@main/core/Session';
import { UnitAbility } from '@main/entities/units/abilities/UnitAbility';
import { hasUnblockedStraightLineBetween } from '@main/maps/MapUtils';

type Props = Readonly<{
  targetUnit: Unit;
}>;

export default class ShootUnitBehavior implements UnitBehavior {
  private readonly targetUnit: Unit;

  constructor({ targetUnit }: Props) {
    this.targetUnit = targetUnit;
  }

  /** @override {@link UnitBehavior#issueOrder} */
  issueOrder = (unit: Unit, state: GameState, session: Session): UnitOrder => {
    const { targetUnit } = this;

    const atLeastOneTileAway =
      manhattanDistance(unit.getCoordinates(), targetUnit.getCoordinates()) > 1;
    if (atLeastOneTileAway && canShoot(unit, targetUnit)) {
      const direction = pointAt(unit.getCoordinates(), targetUnit.getCoordinates());
      return new AbilityOrder({ direction, ability: ShootArrow });
    }

    // TODO - instantiating this here is a hack
    return new AttackUnitBehavior({ targetUnit }).issueOrder(unit, state, session);
  };
}

const canShoot = (unit: Unit, targetUnit: Unit): boolean => {
  const ability = UnitAbility.abilityForName(AbilityName.SHOOT_ARROW);
  return (
    unit.getEquipment().getBySlot('RANGED_WEAPON') !== null &&
    unit.getMana() >= ability.manaCost &&
    isInStraightLine(unit.getCoordinates(), targetUnit.getCoordinates()) &&
    hasUnblockedStraightLineBetween(
      unit.getMap(),
      unit.getCoordinates(),
      targetUnit.getCoordinates()
    )
  );
};
