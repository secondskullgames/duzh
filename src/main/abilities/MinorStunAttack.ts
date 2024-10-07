import { type UnitAbility } from './UnitAbility';
import { AbilityName } from './AbilityName';
import Unit, { DefendResult } from '@main/units/Unit';
import { getMeleeDamage } from '@main/units/UnitUtils';
import Sounds from '@main/sounds/Sounds';
import { Coordinates } from '@lib/geometry/Coordinates';
import { pointAt } from '@lib/geometry/CoordinatesUtils';
import { Attack, AttackResult, attackUnit } from '@main/actions/attackUnit';
import { hasEnemyUnit } from '@main/units/controllers/ControllerUtils';
import { Game } from '@main/core/Game';

/**
 * A one-turn variant of {@link StunAttack}
 */
export class MinorStunAttack implements UnitAbility {
  static readonly MANA_COST = 10;
  static readonly DAMAGE_COEFFICIENT = 1;
  readonly name = AbilityName.MINOR_STUN_ATTACK;
  manaCost = MinorStunAttack.MANA_COST;
  readonly icon = 'icon2';
  readonly innate = false;

  isEnabled = (unit: Unit) => unit.getMana() >= this.manaCost;

  isLegal = (unit: Unit, coordinates: Coordinates) => {
    return hasEnemyUnit(unit, coordinates);
  };

  use = async (unit: Unit, coordinates: Coordinates, game: Game) => {
    const { session } = game;
    const map = session.getMap();

    const direction = pointAt(unit.getCoordinates(), coordinates);
    unit.setDirection(direction);

    const targetUnit = map.getUnit(coordinates);
    if (targetUnit) {
      unit.spendMana(this.manaCost);

      const attack: Attack = {
        sound: Sounds.SPECIAL_ATTACK,
        calculateAttackResult: (unit: Unit): AttackResult => {
          const damage = Math.round(
            getMeleeDamage(unit) * MinorStunAttack.DAMAGE_COEFFICIENT
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
          return `${attackerName} hit ${defenderName} for ${damage} damage!  ${defenderName} is stunned!`;
        }
      };
      await attackUnit(unit, targetUnit, attack, game);
      targetUnit.setStunned(1);
    }
  };
}
