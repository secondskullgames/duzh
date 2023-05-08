import Unit from '../Unit';
import Coordinates from '../../../geometry/Coordinates';
import GameState from '../../../core/GameState';
import UnitAbility, { UnitAbilityProps } from './UnitAbility';
import { moveUnit } from '../../../actions/moveUnit';

export default class Strafe extends UnitAbility {
  constructor() {
    super({ name: 'STRAFE', manaCost: 0 });
  }

  use = async (
    unit: Unit,
    coordinates: Coordinates | null,
    { state }: UnitAbilityProps
  ) => {
    if (!coordinates) {
      throw new Error('Strafe requires a target!');
    }
    const map = state.getMap();

    if (map.contains(coordinates) && !map.isBlocked(coordinates)) {
      await moveUnit(unit, coordinates, { state });
    }
  };

  getDamageLogMessage = (unit: Unit, target: Unit, damageTaken: number): string => {
    throw new Error('can\'t get here');
  }
}
