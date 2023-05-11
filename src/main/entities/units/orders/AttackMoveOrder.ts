import UnitOrder, { UnitOrderProps } from './UnitOrder';
import Unit from '../Unit';
import { NormalAttack } from '../abilities/NormalAttack';
import Direction from '../../../geometry/Direction';
import Coordinates from '../../../geometry/Coordinates';

type Props = Readonly<{
  direction: Direction,
}>;

export class AttackMoveOrder implements UnitOrder {
  private readonly direction: Direction;

  constructor({ direction }: Props) {
    this.direction = direction;
  }

  execute = async (
    unit: Unit,
    { state, renderer, imageFactory }: UnitOrderProps
  ): Promise<void> => {
    const coordinates = Coordinates.plus(unit.getCoordinates(), this.direction);
    await NormalAttack.use(
      unit,
      coordinates,
      { state, renderer, imageFactory }
    );
  }
}