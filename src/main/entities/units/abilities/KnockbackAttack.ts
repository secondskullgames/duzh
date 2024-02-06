import { type UnitAbility } from './UnitAbility';
import { AbilityName } from './AbilityName';
import Unit, { DefendResult } from '../Unit';
import Coordinates from '../../../geometry/Coordinates';
import { pointAt } from '../../../utils/geometry';
import Sounds from '../../../sounds/Sounds';
import { sleep } from '../../../utils/promises';
import { moveUnit } from '../../../actions/moveUnit';
import { Attack, AttackResult, attackUnit } from '../../../actions/attackUnit';
import { Session } from '../../../core/Session';
import { GameState } from '../../../core/GameState';

const manaCost = 6;
const damageCoefficient = 0.5;
const stunDuration = 1;

export const KnockbackAttack: UnitAbility = {
  name: AbilityName.KNOCKBACK_ATTACK,
  manaCost,
  icon: 'icon6',
  use: async (
    unit: Unit,
    coordinates: Coordinates | null,
    session: Session,
    state: GameState
  ) => {
    if (!coordinates) {
      throw new Error('KnockbackAttack requires a target!');
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
          const damage = Math.round(unit.getMeleeDamage() * damageCoefficient);
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
          return `${attackerName} hit ${defenderName} for ${damage} damage!  ${defenderName} recoils!`;
        }
      };
      await attackUnit(unit, targetUnit, attack, session, state);

      targetUnit.setStunned(stunDuration);
      if (targetUnit.getLife() > 0) {
        const first = Coordinates.plus(targetUnit.getCoordinates(), direction);
        if (map.contains(first) && !map.isBlocked(first)) {
          await moveUnit(targetUnit, first, session, state);
          await sleep(75);
          if (targetUnit.getLife() > 0) {
            const second = Coordinates.plus(first, direction);
            if (map.contains(second) && !map.isBlocked(second)) {
              await moveUnit(targetUnit, second, session, state);
            }
          }
        }
      }
    }
  }
};
