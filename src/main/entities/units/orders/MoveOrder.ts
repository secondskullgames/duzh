import UnitOrder from './UnitOrder';
import Unit from '../Unit';
import Coordinates from '../../../geometry/Coordinates';
import { pointAt } from '../../../utils/geometry';
import { walk } from '../../../actions/walk';
import { openDoor } from '../../../actions/openDoor';
import { ObjectType } from '../../objects/GameObject';
import Block from '../../objects/Block';
import { pushBlock } from '../../../actions/pushBlock';
import { getDoor } from '../../../maps/MapUtils';
import { GlobalContext } from '../../../core/GlobalContext';

type Props = Readonly<{
  coordinates: Coordinates
}>;

export class MoveOrder implements UnitOrder {
  private readonly coordinates: Coordinates;

  constructor({ coordinates }: Props) {
    this.coordinates = coordinates;
  }

  /**
   * @override {@link UnitOrder#execute}
   */
  execute = async (
    unit: Unit,
    context: GlobalContext
  ): Promise<void> => {
    const { coordinates } = this;
    const { state } = context;
    const map = state.getMap();
    const direction = pointAt(unit.getCoordinates(), coordinates);
    unit.setDirection(direction);

    if (!map.contains(coordinates)) {
      // do nothing
      return;
    } else if (!map.isBlocked(coordinates)) {
      await walk(unit, direction, context);
      return;
    } else {
      const door = getDoor(map, coordinates);
      if (door) {
        await openDoor(unit, door);
        return;
      }

      const block = map.getObjects(coordinates)
        .filter(object => object.getObjectType() === ObjectType.BLOCK)
        .map(object => object as Block)
        .find(block => block.isMovable());

      if (block) {
        await pushBlock(unit, block, context);
        return;
      }
    }
  }
}