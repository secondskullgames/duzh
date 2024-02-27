import UnitOrder from './UnitOrder';
import Unit from '../Unit';
import Coordinates from '../../../geometry/Coordinates';
import { ObjectType } from '../../objects/GameObject';
import Block from '../../objects/Block';
import { pointAt } from '@main/utils/geometry';
import { walk } from '@main/actions/walk';
import { openDoor } from '@main/actions/openDoor';
import { pushBlock } from '@main/actions/pushBlock';
import { getDoor, isBlocked } from '@main/maps/MapUtils';
import { GameState } from '@main/core/GameState';
import { Session } from '@main/core/Session';

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
    const map = session.getMap();
    const { coordinates } = this;
    const direction = pointAt(unit.getCoordinates(), coordinates);
    unit.setDirection(direction);

    if (!map.contains(coordinates)) {
      // do nothing
      return;
    } else if (!isBlocked(map, coordinates)) {
      await walk(unit, direction, session, state);
      return;
    } else {
      const door = getDoor(map, coordinates);
      if (door) {
        await openDoor(unit, door, state);
        return;
      }

      const block = map
        .getObjects(coordinates)
        .filter(object => object.getObjectType() === ObjectType.BLOCK)
        .map(object => object as Block)
        .find(block => block.isMovable());

      if (block) {
        await pushBlock(unit, block, session, state);
        return;
      }
    }
  };
}
