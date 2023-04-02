import Unit from '../Unit';
import GameState from '../../../core/GameState';
import Coordinates from '../../../geometry/Coordinates';
import Pathfinder from '../../../geometry/Pathfinder';
import { UnitAbilities } from '../abilities/UnitAbilities';
import UnitBehavior from './UnitBehavior';

type Props = Readonly<{
  targetUnit: Unit
}>;

export default class AttackUnitBehavior implements UnitBehavior {
  private readonly targetUnit: Unit;

  constructor({ targetUnit }: Props) {
    this.targetUnit = targetUnit;
  }

  /** @override {@link UnitBehavior#execute} */
  execute = async (unit: Unit) => {
    const { targetUnit } = this;
    const state = GameState.getInstance();
    const map = state.getMap();
    const mapRect = map.getRect();
    const unblockedTiles: Coordinates[] = [];

    for (let y = 0; y < mapRect.height; y++) {
      for (let x = 0; x < mapRect.width; x++) {
        if (!map.getTile({ x, y }).isBlocking()) {
          unblockedTiles.push({ x, y });
        } else if (Coordinates.equals({ x, y }, targetUnit.getCoordinates())) {
          unblockedTiles.push({ x, y });
        } else {
          // blocked
        }
      }
    }

    const path: Coordinates[] = new Pathfinder(() => 1).findPath(unit.getCoordinates(), targetUnit.getCoordinates(), unblockedTiles);

    if (path.length > 1) {
      const { x, y } = path[1]; // first tile is the unit's own tile
      const unitAtPoint = map.getUnit({ x, y });
      if (unitAtPoint === null || unitAtPoint === targetUnit) {
        await UnitAbilities.ATTACK.use(unit, { x, y });
      }
    }
  };
}