import AttackUnitBehavior from './AttackUnitBehavior';
import { UnitBehavior } from './UnitBehavior';
import UnitOrder from '../orders/UnitOrder';
import { AbilityOrder } from '../orders/AbilityOrder';
import { AbilityName } from '@main/abilities/AbilityName';
import Unit from '@main/units/Unit';
import {
  isInStraightLine,
  manhattanDistance,
  pointAt
} from '@lib/geometry/CoordinatesUtils';
import { GameState } from '@main/core/GameState';
import { Session } from '@main/core/Session';
import { hasUnblockedStraightLineBetween } from '@main/maps/MapUtils';
import { EquipmentSlot } from '@models/EquipmentSlot';

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
    if (atLeastOneTileAway && canShoot(unit, targetUnit, state)) {
      const shootArrowAbility = state
        .getAbilityFactory()
        .abilityForName(AbilityName.SHOOT_ARROW);
      const direction = pointAt(unit.getCoordinates(), targetUnit.getCoordinates());
      return new AbilityOrder({ direction, ability: shootArrowAbility });
    }

    // TODO - instantiating this here is a hack
    return new AttackUnitBehavior({ targetUnit }).issueOrder(unit, state, session);
  };
}

const canShoot = (unit: Unit, targetUnit: Unit, state: GameState): boolean => {
  const ability = state.getAbilityFactory().abilityForName(AbilityName.SHOOT_ARROW);
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
