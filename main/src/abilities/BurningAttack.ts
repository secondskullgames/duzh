import { Coordinates, pointAt } from '@duzh/geometry';
import { Attack, AttackResult, attackUnit } from '@main/actions/attackUnit';
import { Game } from '@main/core/Game';
import { hasEnemyUnit } from '@main/units/controllers/ControllerUtils';
import { StatusEffect } from '@main/units/effects/StatusEffect';
import Unit, { DefendResult } from '@main/units/Unit';
import { getMeleeDamage } from '@main/units/UnitUtils';
import { AbilityName } from './AbilityName';
import type { UnitAbility } from './UnitAbility';

const attack: Attack = {
  sound: 'special_attack',
  calculateAttackResult: (unit: Unit): AttackResult => {
    const damage = Math.round(getMeleeDamage(unit) * BurningAttack.DAMAGE_COEFFICIENT);
    return { damage };
  },
  getDamageLogMessage: (attacker: Unit, defender: Unit, result: DefendResult): string => {
    const attackerName = attacker.getName();
    const defenderName = defender.getName();
    const damage = result.damageTaken;
    return `${attackerName} hit ${defenderName} with a burning attack for ${damage} damage!`;
  }
};

export class BurningAttack implements UnitAbility {
  static readonly MANA_COST = 6;
  static readonly DAMAGE_COEFFICIENT = 1;
  static readonly BURN_DURATION = 5;

  readonly name = AbilityName.BURNING_ATTACK;
  manaCost = BurningAttack.MANA_COST;
  readonly icon = null;
  readonly innate = false;

  isEnabled = (unit: Unit) =>
    unit.getMana() >= this.manaCost ||
    unit.getEffects().getDuration(StatusEffect.OVERDRIVE) > 0;

  isLegal = (unit: Unit, coordinates: Coordinates) => {
    return hasEnemyUnit(unit, coordinates);
  };

  use = async (unit: Unit, coordinates: Coordinates, game: Game) => {
    const map = unit.getMap();
    const direction = pointAt(unit.getCoordinates(), coordinates);
    unit.setDirection(direction);

    const targetUnit = map.getUnit(coordinates);
    if (targetUnit) {
      if (unit.getEffects().getDuration(StatusEffect.OVERDRIVE) === 0) {
        unit.spendMana(this.manaCost);
      }
      await attackUnit(unit, targetUnit, attack, game);
      targetUnit.setBurning(BurningAttack.BURN_DURATION);
    }
  };
}
