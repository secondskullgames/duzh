import UnitOrder from './UnitOrder';
import Unit from '../Unit';
import Coordinates from '../../../geometry/Coordinates';
import { UnitAbility } from '../abilities/UnitAbility';
import { GameState } from '../../../core/GameState';
import { Session } from '../../../core/Session';

type Props = Readonly<{
  coordinates: Coordinates;
  ability: UnitAbility;
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
  execute = async (unit: Unit, state: GameState, session: Session): Promise<void> => {
    await this.ability.use(unit, this.coordinates, session, state);
  };
}
