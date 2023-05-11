import Unit from '../Unit';
import Coordinates from '../../../geometry/Coordinates';
import Direction from '../../../geometry/Direction';
import { randChoice } from '../../../utils/random';
import UnitOrder, { type OrderContext } from './UnitOrder';
import { NormalAttack } from '../abilities/NormalAttack';

export default class WanderOrder implements UnitOrder {
  /** @override {@link UnitOrder#execute} */
  execute = async (
    unit: Unit,
    { state, renderer, imageFactory }: OrderContext
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
        { state, renderer, imageFactory }
      );
    }
  };
}