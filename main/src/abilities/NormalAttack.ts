import { Coordinates, pointAt } from '@duzh/geometry';
import { Attack, AttackResult, attackUnit } from '@main/actions/attackUnit';
import { Game } from '@main/core/Game';
import { hasEnemyUnit } from '@main/units/controllers/ControllerUtils';
import { StatusEffect } from '@main/units/effects/StatusEffect';
import Unit, { DefendResult } from '@main/units/Unit';
import { getMeleeDamage } from '@main/units/UnitUtils';
import { AbilityName } from './AbilityName';
import { type UnitAbility } from './UnitAbility';

const attack: Attack = {
  sound: 'player_hits_enemy',
  calculateAttackResult: (unit: Unit): AttackResult => {
    return { damage: getMeleeDamage(unit) };
  },
  getDamageLogMessage: (attacker: Unit, defender: Unit, result: DefendResult): string => {
    const attackerName = attacker.getName();
    const defenderName = defender.getName();
    const damage = result.damageTaken;
    return `${attackerName} hit ${defenderName} for ${damage} damage!`;
  }
};

export class NormalAttack implements UnitAbility {
  // Note that you gain 1 passively, so this is really 2 mana per hit
  // TODO should enemy units gain mana?
  static readonly MANA_RETURNED = 1;
  readonly name = AbilityName.ATTACK;
  readonly icon = null;
  readonly manaCost = 0;
  readonly innate = true;

  isEnabled = (unit: Unit) =>
    unit.getMana() >= this.manaCost ||
    unit.getEffects().getDuration(StatusEffect.OVERDRIVE) > 0;

  isLegal = (unit: Unit, coordinates: Coordinates) => {
    return hasEnemyUnit(unit, coordinates);
  };

  use = async (unit: Unit, coordinates: Coordinates, game: Game) => {
    // TODO: verify coordinates are adjacent

    const map = unit.getMap();
    const direction = pointAt(unit.getCoordinates(), coordinates);
    unit.setDirection(direction);
    const targetUnit = map.getUnit(coordinates);
    if (targetUnit) {
      await attackUnit(unit, targetUnit, attack, game);
      unit.gainMana(NormalAttack.MANA_RETURNED);
    }
  };
}
