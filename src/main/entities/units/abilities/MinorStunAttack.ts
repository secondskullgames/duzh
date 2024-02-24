import { type UnitAbility } from './UnitAbility';
import { AbilityName } from './AbilityName';
import Unit, { DefendResult } from '../Unit';
import Coordinates from '../../../geometry/Coordinates';
import { pointAt } from '../../../utils/geometry';
import Sounds from '../../../sounds/Sounds';
import { Attack, AttackResult, attackUnit } from '../../../actions/attackUnit';
import { Session } from '../../../core/Session';
import { GameState } from '../../../core/GameState';
import { getMeleeDamage } from '../UnitUtils';

const manaCost = 15;
const damageCoefficient = 1;

/**
 * A one-turn variant of {@link StunAttack}
 */
export const MinorStunAttack: UnitAbility = {
  name: AbilityName.MINOR_STUN_ATTACK,
  manaCost,
  icon: 'icon2',

  use: async (
    unit: Unit,
    coordinates: Coordinates | null,
    session: Session,
    state: GameState
  ) => {
    if (!coordinates) {
      throw new Error('MinorStunAttack requires a target!');
    }

    const map = session.getMap();
    const { x, y } = coordinates;

    const direction = pointAt(unit.getCoordinates(), coordinates);
    unit.setDirection(direction);

    const targetUnit = map.getUnit({ x, y });
    if (targetUnit) {
      unit.spendMana(manaCost);

      const attack: Attack = {
        sound: Sounds.SPECIAL_ATTACK,
        calculateAttackResult: (unit: Unit): AttackResult => {
          const damage = Math.round(getMeleeDamage(unit) * damageCoefficient);
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
          return `${attackerName} hit ${defenderName} for ${damage} damage!  ${defenderName} is stunned!`;
        }
      };
      await attackUnit(unit, targetUnit, attack, session, state);
      targetUnit.setStunned(1);
    }
  }
};
