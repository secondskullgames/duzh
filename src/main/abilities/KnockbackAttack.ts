import { type UnitAbility } from './UnitAbility';
import { AbilityName } from './AbilityName';
import Unit, { DefendResult } from '@main/units/Unit';
import { getMeleeDamage } from '@main/units/UnitUtils';
import Sounds from '@main/sounds/Sounds';
import { Coordinates } from '@lib/geometry/Coordinates';
import { pointAt } from '@lib/geometry/CoordinatesUtils';
import { sleep } from '@lib/utils/promises';
import { moveUnit } from '@main/actions/moveUnit';
import { Attack, AttackResult, attackUnit } from '@main/actions/attackUnit';
import { Session } from '@main/core/Session';
import { GameState } from '@main/core/GameState';
import { isBlocked } from '@main/maps/MapUtils';
import { hasEnemyUnit } from '@main/units/controllers/ControllerUtils';

const manaCost = 6;
const damageCoefficient = 1;
const stunDuration = 1;
const TWO_TILES = false;

export const KnockbackAttack: UnitAbility = {
  name: AbilityName.KNOCKBACK_ATTACK,
  manaCost,
  icon: 'icon6',
  innate: false,
  isEnabled: unit => unit.getMana() >= manaCost,
  isLegal: (unit: Unit, coordinates: Coordinates) => {
    return hasEnemyUnit(unit, coordinates);
  },
  use: async (
    unit: Unit,
    coordinates: Coordinates,
    session: Session,
    state: GameState
  ) => {
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
          return `${attackerName} hit ${defenderName} for ${damage} damage!  ${defenderName} recoils!`;
        }
      };
      await attackUnit(unit, targetUnit, attack, session, state);

      targetUnit.setStunned(stunDuration);
      if (targetUnit.getLife() > 0) {
        const first = Coordinates.plusDirection(targetUnit.getCoordinates(), direction);
        if (map.contains(first) && !isBlocked(first, map)) {
          await moveUnit(targetUnit, first, session, state);
          if (TWO_TILES) {
            await sleep(75);
            if (targetUnit.getLife() > 0) {
              const second = Coordinates.plusDirection(first, direction);
              if (map.contains(second) && !isBlocked(second, map)) {
                await moveUnit(targetUnit, second, session, state);
              }
            }
          }
        }
      }
    }
  }
};
