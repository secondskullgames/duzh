import AttackUnitBehavior from './AttackUnitBehavior';
import { UnitBehavior } from './UnitBehavior';
import Unit from '../Unit';
import UnitOrder from '../orders/UnitOrder';
import { ShootArrow } from '../abilities/ShootArrow';
import { AbilityOrder } from '../orders/AbilityOrder';
import { canShoot } from '../controllers/ControllerUtils';
import { AbilityName } from '../abilities/AbilityName';
import { pointAt } from '@main/utils/geometry';
import { GameState } from '@main/core/GameState';
import { Session } from '@main/core/Session';
import { manhattanDistance } from '@main/geometry/CoordinatesUtils';

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
