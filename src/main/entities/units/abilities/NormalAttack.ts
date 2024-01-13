import { type UnitAbility, type UnitAbilityContext } from './UnitAbility';
import { AbilityName } from './AbilityName';
import Unit, { DefendResult } from '../Unit';
import Coordinates from '../../../geometry/Coordinates';
import { pointAt } from '../../../utils/geometry';
import { Attack, AttackResult, attackUnit } from '../../../actions/attackUnit';
import Sounds from '../../../sounds/Sounds';

// Note that you gain 1 passively, so this is really 2 mana per hit
const MANA_RETURNED = 1;

export const NormalAttack: UnitAbility = {
  name: AbilityName.ATTACK,
  icon: null,
  manaCost: 0,
  use: async (
    unit: Unit,
    coordinates: Coordinates | null,
    { state, map, session }: UnitAbilityContext
  ) => {
    if (!coordinates) {
      throw new Error('NormalAttack requires a target!');
    }
    // TODO: verify coordinates are adjacent

    const direction = pointAt(unit.getCoordinates(), coordinates);
    unit.setDirection(direction);
    const targetUnit = map.getUnit(coordinates);
    if (targetUnit) {
      const attack: Attack = {
        sound: Sounds.PLAYER_HITS_ENEMY,
        calculateAttackResult: (unit: Unit): AttackResult => {
          const damage = Math.round(unit.getMeleeDamage());
          return { damage };
        },
        getDamageLogMessage: (
          attacker: Unit,
          defender: Unit,
          result: DefendResult
        ): string => {
          const attackerName = attacker.getName();
          const defenderName = defender.getName();
          const damage = result.damageTaken;
          return `${attackerName} hit ${defenderName} for ${damage} damage!`;
        }
      };
      await attackUnit(unit, targetUnit, attack, { state, map, session });
      unit.gainMana(MANA_RETURNED);
    }
  }
};
