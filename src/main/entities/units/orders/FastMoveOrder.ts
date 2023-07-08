import UnitOrder, { type OrderContext } from './UnitOrder';
import Unit from '../Unit';
import Coordinates from '../../../geometry/Coordinates';
import { pointAt } from '../../../utils/geometry';
import { walk } from '../../../actions/walk';
import { openDoor } from '../../../actions/openDoor';
import { ObjectType } from '../../objects/GameObject';
import Block from '../../objects/Block';
import { pushBlock } from '../../../actions/pushBlock';
import { getDoor } from '../../../maps/MapUtils';
import Direction from '../../../geometry/Direction';
import { fastMove } from '../../../actions/fastMove';

type Props = Readonly<{
  direction: Direction
}>;

export class FastMoveOrder implements UnitOrder {
  private readonly direction: Direction;

  constructor({ direction }: Props) {
    this.direction = direction;
  }

  /**
   * @override {@link UnitOrder#execute}
   */
  execute = async (
    unit: Unit,
    { state, map, imageFactory, ticker }: OrderContext
  ): Promise<void> => {
    const { direction } = this;
    unit.setDirection(direction);
    const firstCoordinates = Coordinates.plus(unit.getCoordinates(), direction);

    if (!map.contains(firstCoordinates) || map.isBlocked(firstCoordinates)) {
      // do nothing
      return;
    }

    return fastMove(unit, direction, { state, map, imageFactory, ticker });
  }
}