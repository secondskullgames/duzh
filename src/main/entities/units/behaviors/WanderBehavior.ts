import { UnitBehavior } from './UnitBehavior';
import UnitOrder from '../orders/UnitOrder';
import { AttackMoveOrder } from '../orders/AttackMoveOrder';
import StayOrder from '../orders/StayOrder';
import { randChoice } from '@main/utils/random';
import { GameState, Session } from '@main/core';
import { isBlocked } from '@main/maps/MapUtils';
import { Coordinates, Direction } from '@main/geometry';
import { Unit } from '@main/entities/units';

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
