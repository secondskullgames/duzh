import { type UnitAbility } from './UnitAbility';
import { AbilityName } from './AbilityName';
import Sounds from '../../../sounds/Sounds';
import { Attack, AttackResult, attackUnit } from '@main/actions/attackUnit';
import { Session, GameState } from '@main/core';
import { Coordinates, pointAt } from '@main/geometry';
import { DefendResult, getMeleeDamage, Unit } from '@main/entities/units';

const manaCost = 10;
const damageCoefficient = 1;
const stunDuration = 2;

export const StunAttack: UnitAbility = {
  name: AbilityName.STUN_ATTACK,
  manaCost,
  icon: 'icon2',
  innate: false,

  use: async (
    unit: Unit,
    coordinates: Coordinates | null,
    session: Session,
    state: GameState
  ) => {
    if (!coordinates) {
      throw new Error('StunAttack requires a target!');
    }

    const map = session.getMap();
    const direction = pointAt(unit.getCoordinates(), coordinates);
    unit.setDirection(direction);

    const targetUnit = map.getUnit(coordinates);
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
      targetUnit.setStunned(stunDuration);
    }
  }
};
