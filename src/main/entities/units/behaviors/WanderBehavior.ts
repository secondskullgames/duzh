import { UnitBehavior, type UnitBehaviorContext } from './UnitBehavior';
import Unit from '../Unit';
import Coordinates from '../../../geometry/Coordinates';
import Direction from '../../../geometry/Direction';
import { randChoice } from '../../../utils/random';
import UnitOrder from '../orders/UnitOrder';
import { AttackMoveOrder } from '../orders/AttackMoveOrder';
import StayOrder from '../orders/StayOrder';
import { abilityForName } from '../abilities/abilityForName';
import { AbilityName } from '../abilities/AbilityName';

export default class WanderBehavior implements UnitBehavior {
  /** @override */
  issueOrder = (unit: Unit, { map }: UnitBehaviorContext): UnitOrder => {
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
      return new AttackMoveOrder({
        coordinates,
        ability: abilityForName(AbilityName.ATTACK)
      });
    }
    return new StayOrder();
  };
}
