import Unit from '../Unit';
import Coordinates from '../../../geometry/Coordinates';
import Direction from '../../../geometry/Direction';
import { maxBy } from '../../../utils/arrays';
import { manhattanDistance } from '../../../maps/MapUtils';
import UnitOrder from '../orders/UnitOrder';
import { NormalAttack } from '../abilities/NormalAttack';
import { UnitController, UnitControllerContext } from '../controllers/UnitController';
import StayOrder from '../orders/StayOrder';
import { AttackMoveOrder } from '../orders/AttackMoveOrder';

type Props = Readonly<{
  targetUnit: Unit
}>;

export default class AvoidUnitBehavior implements UnitController {
  private readonly targetUnit: Unit;

  constructor({ targetUnit }: Props) {
    this.targetUnit = targetUnit;
  }

  /** @override {@link UnitController#issueOrder} */
  issueOrder = (
    unit: Unit,
    { state }: UnitControllerContext
  ): UnitOrder => {
    const { targetUnit } = this;
    const map = state.getMap();
    const tiles: Coordinates[] = [];

    for (const direction of Direction.values()) {
      const coordinates = Coordinates.plus(unit.getCoordinates(), direction);
      if (map.contains(coordinates)) {
        if (!map.isBlocked(coordinates)) {
          tiles.push(coordinates);
        } else if (map.getUnit(coordinates) === targetUnit) {
          tiles.push(coordinates);
        }
      }
    }

    if (tiles.length > 0) {
      const coordinates = maxBy(tiles, coordinates => manhattanDistance(coordinates, targetUnit.getCoordinates()));

      return new AttackMoveOrder({
        coordinates,
        ability: NormalAttack
      });
    }
    return new StayOrder();
  };
}