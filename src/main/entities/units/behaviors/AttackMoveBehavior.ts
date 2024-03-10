import UnitOrder from '../orders/UnitOrder';
import Unit from '../Unit';
import Direction from '../../../geometry/Direction';
import Coordinates from '@lib/geometry/Coordinates';
import { isBlocked } from '@main/maps/MapUtils';
import { GameState } from '@main/core/GameState';
import { Session } from '@main/core/Session';
import { UnitBehavior } from '@main/entities/units/behaviors/UnitBehavior';
import StayOrder from '@main/entities/units/orders/StayOrder';
import { MoveOrder } from '@main/entities/units/orders/MoveOrder';
import { AttackOrder } from '@main/entities/units/orders/AttackOrder';

type Props = Readonly<{
  direction: Direction;
}>;

/**
 * Unlike the others, this behavior is used by the player unit
 */
export class AttackMoveBehavior implements UnitBehavior {
  private readonly direction: Direction;

  constructor({ direction }: Props) {
    this.direction = direction;
  }

  issueOrder = (unit: Unit, state: GameState, session: Session): UnitOrder => {
    const map = session.getMap();
    const { direction } = this;
    unit.setDirection(direction);
    const coordinates = Coordinates.plus(unit.getCoordinates(), direction);

    if (!map.contains(coordinates)) {
      return new StayOrder();
    } else {
      if (!isBlocked(map, coordinates)) {
        return new MoveOrder({ coordinates });
      } else {
        return new AttackOrder({ direction });
      }
    }
  };
}
