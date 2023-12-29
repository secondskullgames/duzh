import { type UnitAbility, type UnitAbilityContext } from './UnitAbility';
import { AbilityName } from './AbilityName';
import Unit, { DefendResult } from '../Unit';
import Coordinates from '../../../geometry/Coordinates';
import { pointAt } from '../../../utils/geometry';
import Sounds from '../../../sounds/Sounds';
import { sleep } from '../../../utils/promises';
import { moveUnit } from '../../../actions/moveUnit';
import { Attack, AttackResult, attackUnit } from '../../../actions/attackUnit';

const manaCost = 10;
const damageCoefficient = 1;

export const KnockbackAttack: UnitAbility = {
  name: AbilityName.KNOCKBACK_ATTACK,
  manaCost,
  icon: 'icon6',
  use: async (
    unit: Unit,
    coordinates: Coordinates | null,
    { state, map, session }: UnitAbilityContext
  ) => {
    if (!coordinates) {
      throw new Error('KnockbackAttack requires a target!');
    }

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
      await attackUnit(unit, targetUnit, attack, { state, map, session });

      targetUnit.setStunned(1);
      if (targetUnit.getLife() > 0) {
        const first = Coordinates.plus(targetUnit.getCoordinates(), direction);
        if (map.contains(first) && !map.isBlocked(first)) {
          await moveUnit(targetUnit, first, { state, map, session });
          await sleep(50);
          if (targetUnit.getLife() > 0) {
            const second = Coordinates.plus(first, direction);
            if (map.contains(second) && !map.isBlocked(second)) {
              await moveUnit(targetUnit, second, { state, map, session });
            }
          }
        }
      }
    }
  }
};
