import { UnitBehavior } from './UnitBehavior';
import Unit from '@main/units/Unit';
import { Direction } from '@lib/geometry/Direction';
import { Coordinates } from '@lib/geometry/Coordinates';
import { randChoice } from '@lib/utils/random';
import { GameState } from '@main/core/GameState';
import { Session } from '@main/core/Session';
import { isBlocked } from '@main/maps/MapUtils';
import { UnitOrder } from '@main/units/orders/UnitOrder';
import { StayOrder } from '@main/units/orders/StayOrder';
import { getMoveOrAttackOrder } from '@main/actions/getMoveOrAttackOrder';

export default class WanderBehavior implements UnitBehavior {
  /** @override */
  issueOrder = (unit: Unit, state: GameState, session: Session): UnitOrder => {
    const map = session.getMap();
    const possibleDirections: Direction[] = [];

    for (const direction of Direction.values()) {
      const coordinates = Coordinates.plusDirection(unit.getCoordinates(), direction);
      if (map.contains(coordinates) && !isBlocked(map, coordinates)) {
        possibleDirections.push(direction);
      }
    }

    if (possibleDirections.length > 0) {
      const direction = randChoice(possibleDirections);
      return getMoveOrAttackOrder(unit, direction);
    }
    return StayOrder.create();
  };
}
