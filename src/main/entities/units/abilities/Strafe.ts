import Unit from '../Unit';
import Coordinates from '../../../geometry/Coordinates';
import GameState from '../../../core/GameState';
import UnitAbility from './UnitAbility';
import UnitService from '../UnitService';

export default class Strafe extends UnitAbility {
  constructor() {
    super({ name: 'STRAFE', manaCost: 0 });
  }

  use = async (unit: Unit, coordinates: Coordinates | null) => {
    if (!coordinates) {
      throw new Error('Strafe requires a target!');
    }
    const map = GameState.getInstance().getMap();

    if (map.contains(coordinates) && !map.isBlocked(coordinates)) {
      await UnitService.getInstance().moveUnit(unit, coordinates);
    }
  };

  getDamageLogMessage = (unit: Unit, target: Unit, damageTaken: number): string => {
    throw new Error('can\'t get here');
  }
}
