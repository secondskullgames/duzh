import { type UnitAbility } from './UnitAbility';
import { AbilityName } from './AbilityName';
import Unit, { DefendResult } from '@main/units/Unit';
import Sounds from '@main/sounds/Sounds';
import { getMeleeDamage } from '@main/units/UnitUtils';
import { Coordinates } from '@lib/geometry/Coordinates';
import { pointAt } from '@lib/geometry/CoordinatesUtils';
import { Attack, AttackResult, attackUnit } from '@main/actions/attackUnit';
import { attackObject } from '@main/actions/attackObject';
import { getSpawner } from '@main/maps/MapUtils';
import { Session } from '@main/core/Session';
import { GameState } from '@main/core/GameState';
import { hasEnemyUnit } from '@main/units/controllers/ControllerUtils';

const manaCost = 0;
const damageCoefficient = 1;

export const PiercingAttack: UnitAbility = {
  name: AbilityName.PIERCE,
  manaCost,
  icon: 'icon1', // TODO
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
          return `${attackerName} hit ${defenderName} for ${damage} damage!`;
        }
      };
      await attackUnit(unit, targetUnit, attack, session, state);
    }

    const nextCoordinates = Coordinates.plusDirection(coordinates, unit.getDirection());
    const nextUnit = map.getUnit(nextCoordinates);
    if (nextUnit) {
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
          return `${attackerName} hit ${defenderName} for ${damage} damage!`;
        }
      };
      await attackUnit(unit, nextUnit, attack, session, state);
    }

    const spawner = getSpawner(map, coordinates);
    if (spawner && spawner.isBlocking()) {
      await attackObject(unit, spawner, state);
    }

    const nextSpawner = getSpawner(map, nextCoordinates);
    if (nextSpawner && nextSpawner.isBlocking()) {
      await attackObject(unit, nextSpawner, state);
    }
  }
};
