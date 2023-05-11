import UnitOrder, { UnitOrderProps } from './UnitOrder';
import Unit from '../Unit';
import Coordinates from '../../../geometry/Coordinates';
import { UnitAbility } from '../abilities/UnitAbility';

type Props = Readonly<{
  coordinates: Coordinates,
  ability: UnitAbility
}>;

export class AbilityOrder implements UnitOrder {
  private readonly coordinates: Coordinates;
  private readonly ability: UnitAbility;

  constructor({ coordinates, ability }: Props) {
    this.coordinates = coordinates;
    this.ability = ability;
  }

  execute = async (
    unit: Unit,
    { state, renderer, imageFactory }: UnitOrderProps
  ): Promise<void> => {
    await this.ability.use(
      unit,
      this.coordinates,
      { state, renderer, imageFactory }
    );
  }
}