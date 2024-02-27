import { UnitBehavior } from './UnitBehavior';
import { UnitOrder, AbilityOrder, StayOrder } from '@main/entities/units/orders';
import { ShootTurretArrow, AbilityName } from '@main/entities/units/abilities';
import { GameState, Session } from '@main/core';
import { pointAt } from '@main/geometry';
import { Unit } from '@main/entities/units';
import { canShoot } from '@main/entities/units/controllers';

type Props = Readonly<{
  targetUnit: Unit;
}>;

export class ShootUnitStationaryBehavior implements UnitBehavior {
  private readonly targetUnit: Unit;

  constructor({ targetUnit }: Props) {
    this.targetUnit = targetUnit;
  }

  /** @override {@link UnitBehavior#issueOrder} */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  issueOrder = (unit: Unit, state: GameState, session: Session): UnitOrder => {
    const { targetUnit } = this;

    if (canShoot(unit, targetUnit, AbilityName.SHOOT_TURRET_ARROW)) {
      const direction = pointAt(unit.getCoordinates(), targetUnit.getCoordinates());
      return new AbilityOrder({
        direction,
        ability: ShootTurretArrow
      });
    }

    return new StayOrder();
  };
}
