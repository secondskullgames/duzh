import UnitOrder from './UnitOrder';
import { UnitAbility } from '../abilities/UnitAbility';
import { Coordinates, Direction } from '@main/geometry';
import { GameState, Session } from '@main/core';
import { Unit } from '@main/entities/units';

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
