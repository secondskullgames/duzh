import Unit from '../Unit';
import Coordinates from '../../../geometry/Coordinates';
import { manhattanDistance } from '../../../maps/MapUtils';
import { UnitAbilities } from '../abilities/UnitAbilities';
import { comparingReversed } from '../../../utils/arrays';
import UnitBehavior, { UnitBehaviorProps } from './UnitBehavior';

type Props = Readonly<{
  targetUnit: Unit
}>;

export default class TeleportAwayBehavior implements UnitBehavior {
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

    for (let y = 0; y < map.height; y++) {
      for (let x = 0; x < map.width; x++) {
        if (map.contains({ x, y })) {
          if (!map.isBlocked({ x, y })) {
            if (manhattanDistance(unit.getCoordinates(), { x, y }) <= UnitAbilities.TELEPORT.RANGE) {
              tiles.push({ x, y });
            }
          }
        }
      }
    }

    if (tiles.length > 0) {
      const orderedTiles = tiles.sort(comparingReversed(coordinates => manhattanDistance(coordinates, targetUnit.getCoordinates())));

      const coordinates = orderedTiles[0];
      await UnitAbilities.TELEPORT.use(
        unit,
        coordinates,
        { state, renderer }
      );
    }
  };
}