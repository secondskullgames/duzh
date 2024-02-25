import { UnitBehavior } from './UnitBehavior';
import Unit from '../Unit';
import UnitOrder from '../orders/UnitOrder';
import { pointAt } from '../../../utils/geometry';
import { AbilityOrder } from '../orders/AbilityOrder';
import Coordinates from '../../../geometry/Coordinates';
import StayOrder from '../orders/StayOrder';
import { ShootTurretArrow } from '../abilities/ShootTurretArrow';
import { GameState } from '../../../core/GameState';
import { Session } from '../../../core/Session';
import { AbilityName } from '../abilities/AbilityName';
import { canShoot } from '../controllers/ControllerUtils';

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
      const coordinates = Coordinates.plus(unit.getCoordinates(), direction);
      return new AbilityOrder({
        coordinates,
        ability: ShootTurretArrow
      });
    }

    return new StayOrder();
  };
}
