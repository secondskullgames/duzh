import Coordinates from '../../../geometry/Coordinates';
import Unit from '../Unit';
import { AbilityName } from './AbilityName';
import { GlobalContext } from '../../../core/GlobalContext';

export type UnitAbility = Readonly<{
  name: AbilityName,
  manaCost: number,
  icon: string | null,

  use: (
    unit: Unit,
    coordinates: Coordinates | null,
    context: GlobalContext
  ) => Promise<void>;
}>;
