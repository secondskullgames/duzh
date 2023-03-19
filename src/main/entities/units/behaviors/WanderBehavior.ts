import Unit from '../Unit';
import GameState from '../../../core/GameState';
import Coordinates from '../../../geometry/Coordinates';
import Direction from '../../../geometry/Direction';
import { randChoice } from '../../../utils/random';
import { UnitAbilities } from '../abilities/UnitAbilities';
import UnitBehavior from './UnitBehavior';

export default class WanderBehavior implements UnitBehavior {
  /** @override {@link UnitBehavior#execute} */
  execute = async (unit: Unit) => {
    const state = GameState.getInstance();
    const map = state.getMap();
    const tiles: Coordinates[] = [];

    for (const { dx, dy } of Direction.values()) {
      const { x, y } = Coordinates.plus(unit.getCoordinates(), { dx, dy });
      if (map.contains({ x, y })) {
        if (!map.isBlocked({ x, y })) {
          tiles.push({ x, y });
        }
      }
    }

    if (tiles.length > 0) {
      const { x, y } = randChoice(tiles);
      await UnitAbilities.ATTACK.use(unit, { x, y });
    }
  };
}