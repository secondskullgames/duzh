import Unit from '../Unit';
import Coordinates from '../../../geometry/Coordinates';
import Direction from '../../../geometry/Direction';
import { randChoice } from '../../../utils/random';
import UnitOrder from '../orders/UnitOrder';
import { NormalAttack } from '../abilities/NormalAttack';
import { AttackMoveOrder } from '../orders/AttackMoveOrder';
import { UnitBehavior } from './UnitBehavior';
import StayOrder from '../orders/StayOrder';
import { GlobalContext } from '../../../core/GlobalContext';

export default class WanderBehavior implements UnitBehavior {
  /** @override {@link UnitBehavior#issueOrder} */
  issueOrder = (
    unit: Unit,
    context: GlobalContext
  ): UnitOrder => {
    const { state } = context;
    const map = state.getMap();
    const tiles: Coordinates[] = [];

    for (const direction of Direction.values()) {
      const coordinates = Coordinates.plus(unit.getCoordinates(), direction);
      if (map.contains(coordinates)) {
        if (!map.isBlocked(coordinates)) {
          tiles.push(coordinates);
        }
      }
    }

    if (tiles.length > 0) {
      const coordinates = randChoice(tiles);
      return new AttackMoveOrder({ coordinates, ability: NormalAttack });
    }
    return new StayOrder();
  };
}