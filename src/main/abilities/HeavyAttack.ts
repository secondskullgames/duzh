import { AbilityName } from './AbilityName';
import Unit, { DefendResult } from '@main/units/Unit';
import { getMeleeDamage } from '@main/units/UnitUtils';
import Sounds from '@main/sounds/Sounds';
import { Coordinates } from '@lib/geometry/Coordinates';
import { pointAt } from '@lib/geometry/CoordinatesUtils';
import { Attack, AttackResult, attackUnit } from '@main/actions/attackUnit';
import { Session } from '@main/core/Session';
import { GameState } from '@main/core/GameState';
import { hasEnemyUnit } from '@main/units/controllers/ControllerUtils';
import type { UnitAbility } from './UnitAbility';

const manaCost = 6;
const damageCoefficient = 1.5;

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
      await attackUnit(unit, targetUnit, attack, session, state);
    }
  }
};
