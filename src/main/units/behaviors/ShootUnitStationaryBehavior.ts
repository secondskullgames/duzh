import { UnitBehavior } from './UnitBehavior';
import UnitOrder from '../orders/UnitOrder';
import { AbilityOrder } from '../orders/AbilityOrder';
import StayOrder from '../orders/StayOrder';
import { AbilityName } from '@main/abilities/AbilityName';
import Unit from '@main/units/Unit';
import { GameState } from '@main/core/GameState';
import { Session } from '@main/core/Session';
import { isInStraightLine, pointAt } from '@lib/geometry/CoordinatesUtils';
import { hasUnblockedStraightLineBetween } from '@main/maps/MapUtils';

type Props = Readonly<{
  targetUnit: Unit;
}>;

export default class ShootUnitStationaryBehavior implements UnitBehavior {
  private readonly targetUnit: Unit;

  constructor({ targetUnit }: Props) {
    this.targetUnit = targetUnit;
  }

  /** @override {@link UnitBehavior#issueOrder} */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  issueOrder = (unit: Unit, state: GameState, session: Session): UnitOrder => {
    const { targetUnit } = this;

    const canShoot = _canShoot(unit, targetUnit, state);
    if (canShoot) {
      const shootTurretArrowAbility = state
        .getAbilityFactory()
        .abilityForName(AbilityName.SHOOT_TURRET_ARROW);
      const direction = pointAt(unit.getCoordinates(), targetUnit.getCoordinates());
      return new AbilityOrder({
        direction,
        ability: shootTurretArrowAbility
      });
    }

    return new StayOrder();
  };
}

const _canShoot = (unit: Unit, targetUnit: Unit, state: GameState): boolean => {
  const ability = state
    .getAbilityFactory()
    .abilityForName(AbilityName.SHOOT_TURRET_ARROW);

  return (
    unit.getMana() >= ability.manaCost &&
    isInStraightLine(unit.getCoordinates(), targetUnit.getCoordinates()) &&
    hasUnblockedStraightLineBetween(
      unit.getMap(),
      unit.getCoordinates(),
      targetUnit.getCoordinates()
    )
  );
};
