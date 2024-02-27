import UnitOrder from './UnitOrder';
import Unit from '../Unit';
import { UnitAbility } from '../abilities/UnitAbility';
import Coordinates from '../../../geometry/Coordinates';
import { GameState } from '@main/core/GameState';
import { Session } from '@main/core/Session';

type Props = Readonly<{
  ability: UnitAbility;
  coordinates: Coordinates;
}>;

export class SpellOrder implements UnitOrder {
  // For now, these are the same, but think about it
  private readonly ability: UnitAbility;
  private readonly coordinates: Coordinates;

  constructor({ ability, coordinates }: Props) {
    this.ability = ability;
    this.coordinates = coordinates;
  }

  /**
   * @override {@link UnitOrder#execute}
   */
  execute = async (unit: Unit, state: GameState, session: Session): Promise<void> => {
    await this.ability.use(unit, this.coordinates, session, state);
  };
}
