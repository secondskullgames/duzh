import { type UnitAbility } from './UnitAbility';
import { AbilityName } from './AbilityName';
import Sounds from '@main/sounds/Sounds';
import { Coordinates, pointAt } from '@duzh/geometry';
import Unit, { DefendResult } from '@main/units/Unit';
import { getMeleeDamage } from '@main/units/UnitUtils';
import { Attack, AttackResult, attackUnit } from '@main/actions/attackUnit';
import { hasEnemyUnit } from '@main/units/controllers/ControllerUtils';
import { Game } from '@main/core/Game';

const attack: Attack = {
  sound: Sounds.PLAYER_HITS_ENEMY,
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

  isEnabled = () => true;

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
