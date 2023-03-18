import Unit from '../Unit';
import Coordinates from '../../../geometry/Coordinates';
import GameState from '../../../core/GameState';
import UnitAbility from './UnitAbility';

export default class Strafe extends UnitAbility {
  constructor() {
    super({ name: 'STRAFE', manaCost: 0 });
  }

  use = async (unit: Unit, coordinates: Coordinates | null) => {
    if (!coordinates) {
      throw new Error('Strafe requires a target!');
    }
    const map = GameState.getInstance().getMap();
    const { x, y } = coordinates;

    if (map.contains({ x, y }) && !map.isBlocked({ x, y })) {
      await unit.moveTo({ x, y });
    }
  };

  getDamageLogMessage = (unit: Unit, target: Unit, damageTaken: number): string => {
    throw new Error('can\'t get here');
  }
}
