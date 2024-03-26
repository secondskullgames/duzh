import UnitOrder from './UnitOrder';
import Unit from '@main/units/Unit';
import { Coordinates } from '@lib/geometry/Coordinates';
import { walk } from '@main/actions/walk';
import { openDoor } from '@main/actions/openDoor';
import { pushBlock } from '@main/actions/pushBlock';
import { getDoor, getMovableBlock, isBlocked } from '@main/maps/MapUtils';
import { GameState } from '@main/core/GameState';
import { Session } from '@main/core/Session';
import { pointAt } from '@lib/geometry/CoordinatesUtils';
import { check } from '@lib/utils/preconditions';

type Props = Readonly<{
  coordinates: Coordinates;
}>;

export class MoveOrder implements UnitOrder {
  private readonly coordinates: Coordinates;

  constructor({ coordinates }: Props) {
    this.coordinates = coordinates;
  }

  /**
   * @override {@link UnitOrder#execute}
   */
  execute = async (unit: Unit, state: GameState, session: Session): Promise<void> => {
    const map = unit.getMap();
    const { coordinates } = this;
    const direction = pointAt(unit.getCoordinates(), coordinates);
    unit.setDirection(direction);

    check(map.contains(coordinates));
    if (!isBlocked(map, coordinates)) {
      await walk(unit, direction, session, state);
      return;
    } else {
      const door = getDoor(map, coordinates);
      if (door) {
        await openDoor(unit, door, state);
        return;
      }

      const block = getMovableBlock(map, coordinates);
      if (block) {
        await pushBlock(unit, block, session, state);
        return;
      }
    }
  };
}
