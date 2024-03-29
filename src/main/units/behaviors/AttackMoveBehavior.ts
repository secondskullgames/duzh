import UnitOrder from '../orders/UnitOrder';
import Unit from '@main/units/Unit';
import { Direction } from '@lib/geometry/Direction';
import { Coordinates } from '@lib/geometry/Coordinates';
import { isBlocked } from '@main/maps/MapUtils';
import { GameState } from '@main/core/GameState';
import { Session } from '@main/core/Session';
import { UnitBehavior } from '@main/units/behaviors/UnitBehavior';
import StayOrder from '@main/units/orders/StayOrder';
import { MoveOrder } from '@main/units/orders/MoveOrder';
import { AttackOrder } from '@main/units/orders/AttackOrder';

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
