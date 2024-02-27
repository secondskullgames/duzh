import { AbilityName } from './AbilityName';
import Unit, { DefendResult } from '../Unit';
import Coordinates from '../../../geometry/Coordinates';
import Sounds from '../../../sounds/Sounds';
import { getMeleeDamage } from '../UnitUtils';
import Direction from '../../../geometry/Direction';
import { pointAt } from '@main/geometry/CoordinatesUtils';
import { Attack, AttackResult, attackUnit } from '@main/actions/attackUnit';
import { Session } from '@main/core/Session';
import { GameState } from '@main/core/GameState';
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

export const Cleave: UnitAbility = {
  name: AbilityName.CLEAVE,
  manaCost,
  icon: 'icon7',
  innate: false,
  use: async (
    unit: Unit,
    coordinates: Coordinates,
    session: Session,
    state: GameState
  ) => {
    const direction = pointAt(unit.getCoordinates(), coordinates);
    unit.setDirection(direction);

    const targetUnits = _getTargetUnits(unit, direction);
    if (targetUnits.length > 0) {
      unit.spendMana(manaCost);
    }

    // TODO: consider making this simultaneous
    for (const targetUnit of targetUnits) {
      await attackUnit(unit, targetUnit, attack, session, state);
    }
  }
};

/**
 * Returns the units that will be affected by a cleave attack.
 * Specifically, this means the unit directly ahead of the
 * attacking unit, plus any units to the left or right of that
 * unit.
 */
const _getTargetUnits = (unit: Unit, direction: Direction): Unit[] => {
  const map = unit.getMap();
  const coordinates = unit.getCoordinates();
  const targetCoordinates = Coordinates.plus(coordinates, direction);
  const targetUnit = map.getUnit(targetCoordinates);
  if (!targetUnit) {
    return [];
  }

  const leftCoordinates = Coordinates.plus(
    targetCoordinates,
    Direction.rotateCounterClockwise(direction)
  );
  const rightCoordinates = Coordinates.plus(
    targetCoordinates,
    Direction.rotateClockwise(direction)
  );
  const leftUnit = map.getUnit(leftCoordinates);
  const rightUnit = map.getUnit(rightCoordinates);
  return [leftUnit, targetUnit, rightUnit].filter(Boolean) as Unit[];
};
