import { type UnitAbility } from './UnitAbility';
import { AbilityName } from './AbilityName';
import Sounds from '@main/sounds/Sounds';
import { Coordinates } from '@lib/geometry/Coordinates';
import Unit, { DefendResult } from '@main/units/Unit';
import { getMeleeDamage } from '@main/units/UnitUtils';
import { pointAt } from '@lib/geometry/CoordinatesUtils';
import { Session } from '@main/core/Session';
import { Attack, AttackResult, attackUnit } from '@main/actions/attackUnit';
import { GameState } from '@main/core/GameState';

// Note that you gain 1 passively, so this is really 3 mana per hit
// TODO should enemy units gain mana?
const MANA_RETURNED = 1;

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

export const NormalAttack: UnitAbility = {
  name: AbilityName.ATTACK,
  icon: null,
  manaCost: 0,
  innate: true,
  isEnabled: () => true,
  use: async (
    unit: Unit,
    coordinates: Coordinates,
    session: Session,
    state: GameState
  ) => {
    // TODO: verify coordinates are adjacent

    const map = unit.getMap();
    const direction = pointAt(unit.getCoordinates(), coordinates);
    unit.setDirection(direction);
    const targetUnit = map.getUnit(coordinates);
    if (targetUnit) {
      await attackUnit(unit, targetUnit, attack, session, state);
      unit.gainMana(MANA_RETURNED);
    }
  }
};
