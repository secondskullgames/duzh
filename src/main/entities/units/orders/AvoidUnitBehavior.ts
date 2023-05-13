import Unit from '../Unit';
import Coordinates from '../../../geometry/Coordinates';
import Direction from '../../../geometry/Direction';
import { comparingReversed } from '../../../utils/arrays';
import { manhattanDistance } from '../../../maps/MapUtils';
import UnitOrder from './UnitOrder';
import { NormalAttack } from '../abilities/NormalAttack';
import { UnitController, UnitControllerContext } from '../controllers/UnitController';
import { AbilityOrder } from './AbilityOrder';
import StayOrder from './StayOrder';

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

    for (const { dx, dy } of Direction.values()) {
      const coordinates = Coordinates.plus(unit.getCoordinates(), { dx, dy });
      if (map.contains(coordinates)) {
        if (!map.isBlocked(coordinates)) {
          tiles.push(coordinates);
        } else if (map.getUnit(coordinates)) {
          if (map.getUnit(coordinates) === targetUnit) {
            tiles.push(coordinates);
          }
        }
      }
    }

    if (tiles.length > 0) {
      const orderedTiles = tiles.sort(comparingReversed(coordinates => manhattanDistance(coordinates, targetUnit.getCoordinates())));

      const coordinates = orderedTiles[0];
      return new AbilityOrder({
        coordinates,
        ability: NormalAttack
      });
    }
    return new StayOrder();
  };
}