import Unit from '../Unit';
import Coordinates from '../../../geometry/Coordinates';
import { type UnitAbility } from './UnitAbility';
import { moveUnit } from '../../../actions/moveUnit';
import { AbilityName } from './AbilityName';
import { GlobalContext } from '../../../core/GlobalContext';

export const Strafe: UnitAbility = {
  name: AbilityName.STRAFE,
  manaCost: 0,
  icon: null,

  use: async (
    unit: Unit,
    coordinates: Coordinates | null,
    context: GlobalContext
  ) => {
    if (!coordinates) {
      throw new Error('Strafe requires a target!');
    }
    const { state } = context;
    const map = state.getMap();

    if (map.contains(coordinates) && !map.isBlocked(coordinates)) {
      await moveUnit(unit, coordinates, context);
    }
  }
}
