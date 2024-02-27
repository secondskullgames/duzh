import { AttackUnitBehavior } from './AttackUnitBehavior';
import { UnitBehavior } from './UnitBehavior';
import { GameState, Session } from '@main/core';
import { manhattanDistance, pointAt } from '@main/geometry';
import { Unit } from '@main/entities/units';
import { AbilityOrder, UnitOrder } from '@main/entities/units/orders';
import { AbilityName, ShootArrow } from '@main/entities/units/abilities';
import { canShoot } from '@main/entities/units/controllers';

type Props = Readonly<{
  targetUnit: Unit;
}>;

export class ShootUnitBehavior implements UnitBehavior {
  private readonly targetUnit: Unit;

  constructor({ targetUnit }: Props) {
    this.targetUnit = targetUnit;
  }

  /** @override {@link UnitBehavior#issueOrder} */
  issueOrder = (unit: Unit, state: GameState, session: Session): UnitOrder => {
    const { targetUnit } = this;

    if (
      manhattanDistance(unit.getCoordinates(), targetUnit.getCoordinates()) > 1 &&
      canShoot(unit, targetUnit, AbilityName.SHOOT_ARROW)
    ) {
      const direction = pointAt(unit.getCoordinates(), targetUnit.getCoordinates());
      return new AbilityOrder({
        direction,
        ability: ShootArrow
      });
    }

    // TODO - instantiating this here is a hack
    return new AttackUnitBehavior({ targetUnit }).issueOrder(unit, state, session);
  };
}
