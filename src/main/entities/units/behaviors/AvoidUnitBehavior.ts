import Unit from '../Unit';
import Coordinates from '../../../geometry/Coordinates';
import Direction from '../../../geometry/Direction';
import { comparingReversed } from '../../../utils/arrays';
import { manhattanDistance } from '../../../maps/MapUtils';
import UnitBehavior, { UnitBehaviorProps } from './UnitBehavior';
import { NormalAttack } from '../abilities/NormalAttack';

type Props = Readonly<{
  targetUnit: Unit
}>;

export default class AvoidUnitBehavior implements UnitBehavior {
  private readonly targetUnit: Unit;

  constructor({ targetUnit }: Props) {
    this.targetUnit = targetUnit;
  }

  /** @override {@link UnitBehavior#execute} */
  execute = async (
    unit: Unit,
    { state, renderer }: UnitBehaviorProps
  ) => {
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
      await NormalAttack.use(
        unit,
        coordinates,
        { state, renderer }
      );
    }
  };
}