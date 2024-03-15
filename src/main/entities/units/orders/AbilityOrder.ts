import UnitOrder from './UnitOrder';
import Unit from '../Unit';
import { UnitAbility } from '../abilities/UnitAbility';
import Direction from '@lib/geometry/Direction';
import Coordinates from '@lib/geometry/Coordinates';
import { GameState } from '@main/core/GameState';
import { Session } from '@main/core/Session';

type Props = Readonly<{
  ability: UnitAbility;
  direction: Direction;
}>;

export class AbilityOrder implements UnitOrder {
  private readonly ability: UnitAbility;
  private readonly direction: Direction;

  constructor({ ability, direction }: Props) {
    this.ability = ability;
    this.direction = direction;
  }

  /**
   * @override {@link UnitOrder#execute}
   */
  execute = async (unit: Unit, state: GameState, session: Session): Promise<void> => {
    const coordinates = Coordinates.plus(unit.getCoordinates(), this.direction);
    await this.ability.use(unit, coordinates, session, state);
  };
}
