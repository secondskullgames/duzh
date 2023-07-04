import Unit from '../Unit';
import Coordinates from '../../../geometry/Coordinates';
import { pointAt } from '../../../utils/geometry';
import { type UnitAbility } from './UnitAbility';
import { attackUnit } from '../../../actions/attackUnit';
import { AbilityName } from './AbilityName';
import Sounds from '../../../sounds/Sounds';
import { GlobalContext } from '../../../core/GlobalContext';

// Note that you gain 1 passively, so this is really 3 mana per hit
const MANA_RETURNED = 2;

export const NormalAttack: UnitAbility = {
  name: AbilityName.ATTACK,
  icon: null,
  manaCost: 0,
  use: async (
    unit: Unit,
    coordinates: Coordinates | null,
    context: GlobalContext
  ) => {
    if (!coordinates) {
      throw new Error('NormalAttack requires a target!');
    }
    // TODO: verify coordinates are adjacent

    const { state } = context;
    const map = state.getMap();
    const direction = pointAt(unit.getCoordinates(), coordinates);
    unit.setDirection(direction);
    const targetUnit = map.getUnit(coordinates);
    if (targetUnit) {
      await attackUnit(
        {
          attacker: unit,
          defender: targetUnit,
          getDamage: unit => unit.getMeleeDamage(),
          getDamageLogMessage,
          sound: Sounds.PLAYER_HITS_ENEMY
        },
        context
      );
      unit.gainMana(MANA_RETURNED);
    }
  }
};

const getDamageLogMessage = (unit: Unit, target: Unit, damageTaken: number): string => {
  return `${unit.getName()} hit ${target.getName()} for ${damageTaken} damage!`;
}