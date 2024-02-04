import { AbilityName } from './AbilityName';
import Coordinates from '../../../geometry/Coordinates';
import Unit from '../Unit';
import { GameState } from '../../../core/GameState';
import { Session } from '../../../core/Session';

export type UnitAbility = Readonly<{
  name: AbilityName;
  manaCost: number;
  icon: string | null;

  use: (
    unit: Unit,
    coordinates: Coordinates | null,
    session: Session,
    state: GameState
  ) => Promise<void>;
}>;
