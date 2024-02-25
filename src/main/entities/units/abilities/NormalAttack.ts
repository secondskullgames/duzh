import { type UnitAbility } from './UnitAbility';
import { AbilityName } from './AbilityName';
import Unit, { DefendResult } from '../Unit';
import Coordinates from '../../../geometry/Coordinates';
import { pointAt } from '../../../utils/geometry';
import { Attack, AttackResult, attackUnit } from '../../../actions/attackUnit';
import Sounds from '../../../sounds/Sounds';
import { Session } from '../../../core/Session';
import { GameState } from '../../../core/GameState';
import { getMeleeDamage } from '../UnitUtils';

// Note that you gain 1 passively, so this is really 3 mana per hit
// TODO should enemy units gain mana?
const MANA_RETURNED = 1;

export const NormalAttack: UnitAbility = {
  name: AbilityName.ATTACK,
  icon: null,
  manaCost: 0,
  innate: true,
  use: async (
    unit: Unit,
    coordinates: Coordinates | null,
    session: Session,
    state: GameState
  ) => {
    if (!coordinates) {
      throw new Error('NormalAttack requires a target!');
    }
    // TODO: verify coordinates are adjacent

    const map = session.getMap();
    const direction = pointAt(unit.getCoordinates(), coordinates);
    unit.setDirection(direction);
    const targetUnit = map.getUnit(coordinates);
    if (targetUnit) {
      const attack: Attack = {
        sound: Sounds.PLAYER_HITS_ENEMY,
        calculateAttackResult: (unit: Unit): AttackResult => {
          const damage = Math.round(getMeleeDamage(unit));
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
      await attackUnit(unit, targetUnit, attack, session, state);
      unit.gainMana(MANA_RETURNED);
    }
  }
};
