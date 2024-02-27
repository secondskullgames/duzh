import { UnitBehavior } from './UnitBehavior';
import Unit from '../Unit';
import Coordinates from '../../../geometry/Coordinates';
import Direction from '../../../geometry/Direction';
import UnitOrder from '../orders/UnitOrder';
import { AttackMoveOrder } from '../orders/AttackMoveOrder';
import StayOrder from '../orders/StayOrder';
import { randChoice } from '@main/utils/random';
import { GameState } from '@main/core/GameState';
import { Session } from '@main/core/Session';
import { isBlocked } from '@main/maps/MapUtils';

export default class WanderBehavior implements UnitBehavior {
  /** @override */
  issueOrder = (unit: Unit, state: GameState, session: Session): UnitOrder => {
    const map = session.getMap();
    const possibleDirections: Direction[] = [];

    for (const direction of Direction.values()) {
      const coordinates = Coordinates.plus(unit.getCoordinates(), direction);
      if (map.contains(coordinates) && !isBlocked(map, coordinates)) {
        possibleDirections.push(direction);
      }
    }

    if (possibleDirections.length > 0) {
      const direction = randChoice(possibleDirections);
      return new AttackMoveOrder({ direction });
    }
    return new StayOrder();
  };
}
