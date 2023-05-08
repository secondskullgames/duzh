import Unit from '../Unit';
import Coordinates from '../../../geometry/Coordinates';
import Direction from '../../../geometry/Direction';
import { randChoice } from '../../../utils/random';
import UnitBehavior, { type UnitBehaviorProps } from './UnitBehavior';
import { NormalAttack } from '../abilities/NormalAttack';

export default class WanderBehavior implements UnitBehavior {
  /** @override {@link UnitBehavior#execute} */
  execute = async (
    unit: Unit,
    { state, renderer }: UnitBehaviorProps
  ) => {
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
      await NormalAttack.use(
        unit,
        coordinates,
        { state, renderer }
      );
    }
  };
}