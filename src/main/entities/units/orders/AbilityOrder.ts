import UnitOrder, { UnitOrderProps } from './UnitOrder';
import Unit from '../Unit';
import Direction from '../../../geometry/Direction';
import Coordinates from '../../../geometry/Coordinates';
import { UnitAbility } from '../abilities/UnitAbility';

type Props = Readonly<{
  direction: Direction,
  ability: UnitAbility
}>;

export class AbilityOrder implements UnitOrder {
  private readonly direction: Direction;
  private readonly ability: UnitAbility;

  constructor({ direction, ability }: Props) {
    this.direction = direction;
    this.ability = ability;
  }

  execute = async (
    unit: Unit,
    { state, renderer, imageFactory }: UnitOrderProps
  ): Promise<void> => {
    const coordinates = Coordinates.plus(unit.getCoordinates(), this.direction);
    await this.ability.use(
      unit,
      coordinates,
      { state, renderer, imageFactory }
    );
  }
}