import Unit from '../Unit';
import Coordinates from '../../../geometry/Coordinates';
import { type UnitAbility, type UnitAbilityProps } from './UnitAbility';
import { moveUnit } from '../../../actions/moveUnit';
import { AbilityName } from './AbilityName';

export const Strafe: UnitAbility = {
  name: AbilityName.STRAFE,
  manaCost: 0,
  icon: null,

  use: async (
    unit: Unit,
    coordinates: Coordinates | null,
    { state, renderer, imageFactory }: UnitAbilityProps
  ) => {
    if (!coordinates) {
      throw new Error('Strafe requires a target!');
    }
    const map = state.getMap();

    if (map.contains(coordinates) && !map.isBlocked(coordinates)) {
      await moveUnit(unit, coordinates, { state, renderer, imageFactory });
    }
  },

  getDamageLogMessage: (unit: Unit, target: Unit, damageTaken: number): string => {
    throw new Error('can\'t get here');
  }
}
