import { type UnitAbility } from './UnitAbility';
import { AbilityName } from './AbilityName';
import Unit from '../Unit';
import Coordinates from '../../../geometry/Coordinates';
import { shootFireball } from '../../../actions/shootFireball';
import { pointAt } from '../../../utils/geometry';
import { Session } from '../../../core/Session';

const MANA_COST = 25;
const DAMAGE = 20;

export const ShootFireball: UnitAbility = {
  name: AbilityName.SHOOT_FIREBALL,
  icon: 'icon6',
  manaCost: MANA_COST,

  use: async (unit: Unit, coordinates: Coordinates | null, session: Session) => {
    if (!coordinates) {
      throw new Error('ShootFireball requires a target!');
    }
    const direction = pointAt(unit.getCoordinates(), coordinates);

    unit.spendMana(MANA_COST);
    await shootFireball(unit, direction, DAMAGE, session);
  }
};
