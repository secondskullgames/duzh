import { UnitBehavior } from './UnitBehavior';
import UnitOrder from '../orders/UnitOrder';
import { AbilityOrder } from '../orders/AbilityOrder';
import StayOrder from '../orders/StayOrder';
import { ShootTurretArrow } from '../abilities/ShootTurretArrow';
import { AbilityName } from '../abilities/AbilityName';
import { canShoot } from '../controllers/ControllerUtils';
import { GameState, Session } from '@main/core';
import { pointAt } from '@main/geometry';
import { Unit } from '@main/entities/units';

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
