import UnitOrder from './UnitOrder';
import Unit from '../Unit';
import Coordinates from '../../../geometry/Coordinates';
import { manhattanDistance } from '../../../maps/MapUtils';
import { range as TELEPORT_RANGE, Teleport } from '../abilities/Teleport';
import { comparingReversed } from '../../../utils/arrays';
import { GameState } from '../../../core/GameState';
import { Session } from '../../../core/Session';

type Props = Readonly<{
  targetUnit: Unit;
}>;

export default class TeleportAwayOrder implements UnitOrder {
  private readonly targetUnit: Unit;

  constructor({ targetUnit }: Props) {
    this.targetUnit = targetUnit;
  }

  /** @override */
  execute = async (unit: Unit, state: GameState, session: Session) => {
    const { targetUnit } = this;
    const map = session.getMap();
    const tiles: Coordinates[] = [];

    for (let y = 0; y < map.height; y++) {
      for (let x = 0; x < map.width; x++) {
        if (map.contains({ x, y })) {
          if (!map.isBlocked({ x, y })) {
            if (manhattanDistance(unit.getCoordinates(), { x, y }) <= TELEPORT_RANGE) {
              tiles.push({ x, y });
            }
          }
        }
      }
    }

    if (tiles.length > 0) {
      const orderedTiles = tiles.sort(
        comparingReversed(coordinates =>
          manhattanDistance(coordinates, targetUnit.getCoordinates())
        )
      );

      const coordinates = orderedTiles[0];
      const success = await Teleport.use(unit, coordinates, session, state);
      if (success) {
        unit.recordAbilityUsed(Teleport.name);
      }
    }
  };
}
