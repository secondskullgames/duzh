import AttackUnitBehavior from './AttackUnitBehavior';
import { UnitBehavior } from './UnitBehavior';
import Unit from '../Unit';
import UnitOrder from '../orders/UnitOrder';
import { ShootArrow } from '../abilities/ShootArrow';
import { pointAt } from '../../../utils/geometry';
import { AbilityOrder } from '../orders/AbilityOrder';
import Coordinates from '../../../geometry/Coordinates';
import { GameState } from '../../../core/GameState';
import { Session } from '../../../core/Session';
import { manhattanDistance } from '../../../geometry/CoordinatesUtils';
import { canShoot } from '../controllers/ControllerUtils';
import { AbilityName } from '../abilities/AbilityName';

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
      const coordinates = Coordinates.plus(unit.getCoordinates(), direction);
      return new AbilityOrder({
        coordinates,
        ability: ShootArrow
      });
    }

    // TODO - instantiating this here is a hack
    return new AttackUnitBehavior({ targetUnit }).issueOrder(unit, state, session);
  };
}
