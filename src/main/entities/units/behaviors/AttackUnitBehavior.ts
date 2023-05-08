import Unit from '../Unit';
import Coordinates from '../../../geometry/Coordinates';
import Pathfinder from '../../../geometry/Pathfinder';
import UnitBehavior, { UnitBehaviorProps } from './UnitBehavior';
import { NormalAttack } from '../abilities/NormalAttack';

type Props = Readonly<{
  targetUnit: Unit
}>;

export default class AttackUnitBehavior implements UnitBehavior {
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
    const mapRect = map.getRect();
    const unblockedTiles: Coordinates[] = [];

    for (let y = 0; y < mapRect.height; y++) {
      for (let x = 0; x < mapRect.width; x++) {
        const coordinates = { x, y };
        if (Coordinates.equals(coordinates, targetUnit.getCoordinates())) {
          unblockedTiles.push(coordinates);
        } else if (!map.isBlocked(coordinates)) {
          unblockedTiles.push(coordinates);
        } else {
          // blocked
        }
      }
    }

    const path: Coordinates[] = new Pathfinder(() => 1).findPath(unit.getCoordinates(), targetUnit.getCoordinates(), unblockedTiles);

    if (path.length > 1) {
      const coordinates = path[1]; // first tile is the unit's own tile
      const unitAtPoint = map.getUnit(coordinates);
      if (unitAtPoint === null || unitAtPoint === targetUnit) {
        await NormalAttack.use(
          unit,
          coordinates,
          { state, renderer }
        );
      }
    }
  };
}