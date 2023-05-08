import Unit from '../Unit';
import Coordinates from '../../../geometry/Coordinates';
import Direction from '../../../geometry/Direction';
import { randChoice } from '../../../utils/random';
import { UnitAbilities } from '../abilities/UnitAbilities';
import UnitBehavior, { type UnitBehaviorProps } from './UnitBehavior';

export default class WanderBehavior implements UnitBehavior {
  /** @override {@link UnitBehavior#execute} */
  execute = async (
    unit: Unit,
    { state, renderer, animationFactory }: UnitBehaviorProps
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
      await UnitAbilities.ATTACK.use(
        unit,
        coordinates,
        { state, renderer, animationFactory }
      );
    }
  };
}