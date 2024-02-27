import { AbilityName } from './AbilityName';
import Sounds from '../../../sounds/Sounds';
import { Attack, AttackResult, attackUnit } from '@main/actions/attackUnit';
import { Session, GameState } from '@main/core';
import { Coordinates, pointAt } from '@main/geometry';
import { DefendResult, getMeleeDamage, Unit } from '@main/entities/units';
import type { UnitAbility } from './UnitAbility';

const manaCost = 8;
const damageCoefficient = 2;

const attack: Attack = {
  sound: Sounds.SPECIAL_ATTACK,
  calculateAttackResult: (unit: Unit): AttackResult => {
    const damage = Math.round(getMeleeDamage(unit) * damageCoefficient);
    return { damage };
  },
  getDamageLogMessage: (attacker: Unit, defender: Unit, result: DefendResult): string => {
    const attackerName = attacker.getName();
    const defenderName = defender.getName();
    const damage = result.damageTaken;
    return `${attackerName} hit ${defenderName} with a heavy attack for ${damage} damage!`;
  }
};

export const HeavyAttack: UnitAbility = {
  name: AbilityName.HEAVY_ATTACK,
  manaCost,
  icon: 'icon1',
  innate: false,
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
      await attackUnit(unit, targetUnit, attack, session, state);
    }
  }
};
