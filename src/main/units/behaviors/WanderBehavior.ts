import { UnitBehavior } from './UnitBehavior';
import UnitOrder from '../orders/UnitOrder';
import StayOrder from '../orders/StayOrder';
import Unit from '@main/units/Unit';
import { Direction } from '@lib/geometry/Direction';
import { Coordinates } from '@lib/geometry/Coordinates';
import { randChoice } from '@lib/utils/random';
import { isBlocked } from '@main/maps/MapUtils';
import { AttackMoveBehavior } from '@main/units/behaviors/AttackMoveBehavior';

export default class WanderBehavior implements UnitBehavior {
  /** @override */
  issueOrder = (unit: Unit): UnitOrder => {
    const map = unit.getMap();
    const possibleDirections: Direction[] = [];

    for (const direction of Direction.values()) {
      const coordinates = Coordinates.plus(unit.getCoordinates(), direction);
      if (map.contains(coordinates) && !isBlocked(map, coordinates)) {
        possibleDirections.push(direction);
      }
    }

    if (possibleDirections.length > 0) {
      const direction = randChoice(possibleDirections);
      const behavior = new AttackMoveBehavior({ direction });
      behavior.issueOrder(unit);
    }
    return new StayOrder();
  };
}
