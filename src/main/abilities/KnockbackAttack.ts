import { type UnitAbility } from './UnitAbility';
import { AbilityName } from './AbilityName';
import Unit, { DefendResult } from '@main/units/Unit';
import { getMeleeDamage } from '@main/units/UnitUtils';
import Sounds from '@main/sounds/Sounds';
import { Coordinates } from '@lib/geometry/Coordinates';
import { pointAt } from '@lib/geometry/CoordinatesUtils';
import { sleep } from '@lib/utils/promises';
import { isBlocked } from '@main/maps/MapUtils';
import { hasEnemyUnit } from '@main/units/controllers/ControllerUtils';
import { Game } from '@main/core/Game';
import { Attack, AttackResult } from '@main/controllers/UnitService';

const TWO_TILES = false;

export class KnockbackAttack implements UnitAbility {
  static readonly MANA_COST = 6;
  static readonly DAMAGE_COEFFICIENT = 1;
  static readonly STUN_DURATION = 1;
  readonly name = AbilityName.KNOCKBACK_ATTACK;
  manaCost = KnockbackAttack.MANA_COST;
  readonly icon = 'icon6';
  readonly innate = false;

  isEnabled = (unit: Unit) => unit.getMana() >= this.manaCost;

  isLegal = (unit: Unit, coordinates: Coordinates) => {
    return hasEnemyUnit(unit, coordinates);
  };

  use = async (unit: Unit, coordinates: Coordinates, game: Game) => {
    const map = unit.getMap();
    const direction = pointAt(unit.getCoordinates(), coordinates);
    unit.setDirection(direction);

    const targetUnit = map.getUnit(coordinates);
    if (targetUnit) {
      unit.spendMana(this.manaCost);

      const attack: Attack = {
        sound: Sounds.SPECIAL_ATTACK,
        calculateAttackResult: (unit: Unit): AttackResult => {
          const damage = Math.round(
            getMeleeDamage(unit) * KnockbackAttack.DAMAGE_COEFFICIENT
          );
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
      await game.unitService.attackUnit(unit, targetUnit, attack, game);

      targetUnit.setStunned(KnockbackAttack.STUN_DURATION);
      if (targetUnit.getLife() > 0) {
        const first = Coordinates.plusDirection(targetUnit.getCoordinates(), direction);
        if (map.contains(first) && !isBlocked(first, map)) {
          await game.unitService.moveUnit(targetUnit, first, game);
          if (TWO_TILES) {
            await sleep(75);
            if (targetUnit.getLife() > 0) {
              const second = Coordinates.plusDirection(first, direction);
              if (map.contains(second) && !isBlocked(second, map)) {
                await game.unitService.moveUnit(targetUnit, second, game);
              }
            }
          }
        }
      }
    }
  };
}
