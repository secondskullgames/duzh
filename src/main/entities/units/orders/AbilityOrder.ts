import UnitOrder, { OrderContext } from './UnitOrder';
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

  /**
   * @override {@link UnitOrder#execute}
   */
  execute = async (
    unit: Unit,
    { state, renderer, imageFactory }: OrderContext
  ): Promise<void> => {
    await this.ability.use(
      unit,
      this.coordinates,
      { state, renderer, imageFactory }
    );
  }
}