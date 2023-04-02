import Unit from '../Unit';
import GameState from '../../../core/GameState';
import Coordinates from '../../../geometry/Coordinates';
import Direction from '../../../geometry/Direction';
import { comparingReversed } from '../../../utils/arrays';
import { manhattanDistance } from '../../../maps/MapUtils';
import { UnitAbilities } from '../abilities/UnitAbilities';
import UnitBehavior from './UnitBehavior';

type Props = Readonly<{
  targetUnit: Unit
}>;

export default class AvoidUnitBehavior implements UnitBehavior {
  private readonly targetUnit: Unit;

  constructor({ targetUnit }: Props) {
    this.targetUnit = targetUnit;
  }

  /** @override {@link UnitBehavior#execute} */
  execute = async (unit: Unit) => {
    const state = GameState.getInstance();
    const { targetUnit } = this;
    const map = state.getMap();
    const tiles: Coordinates[] = [];

    for (const { dx, dy } of Direction.values()) {
      const { x, y } = Coordinates.plus(unit.getCoordinates(), { dx, dy });
      if (map.contains({ x, y })) {
        if (!map.isBlocked({ x, y })) {
          tiles.push({ x, y });
        } else if (map.getUnit({ x, y })) {
          if (map.getUnit({ x, y }) === targetUnit) {
            tiles.push({ x, y });
          }
        }
      }
    }

    if (tiles.length > 0) {
      const orderedTiles = tiles.sort(comparingReversed(coordinates => manhattanDistance(coordinates, targetUnit.getCoordinates())));

      const { x, y } = orderedTiles[0];
      await UnitAbilities.ATTACK.use(unit, { x, y });
    }
  };
}