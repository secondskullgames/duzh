import { type UnitAbility, UnitAbilityContext } from './UnitAbility';
import { AbilityName } from './AbilityName';
import Unit, { DefendResult } from '../Unit';
import Coordinates from '../../../geometry/Coordinates';
import { pointAt } from '../../../utils/geometry';
import Sounds from '../../../sounds/Sounds';
import { Attack, AttackResult, attackUnit } from '../../../actions/attackUnit';
import { attackObject } from '../../../actions/attackObject';
import { getSpawner } from '../../../maps/MapUtils';

const damageCoefficient = 1;

export const PiercingAttack: UnitAbility = {
  name: AbilityName.PIERCE,
  manaCost: 0,
  icon: null,

  use: async (
    unit: Unit,
    coordinates: Coordinates | null,
    { state, map, session }: UnitAbilityContext
  ) => {
    if (!coordinates) {
      throw new Error('PiercingAttack requires a target!');
    }

    const direction = pointAt(unit.getCoordinates(), coordinates);
    unit.setDirection(direction);

    const targetUnit = map.getUnit(coordinates);
    if (targetUnit) {
      const attack: Attack = {
        sound: Sounds.SPECIAL_ATTACK,
        calculateAttackResult: (unit: Unit): AttackResult => {
          const damage = Math.round(unit.getMeleeDamage() * damageCoefficient);
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
      await attackUnit(unit, targetUnit, attack, { state, map, session });
    }

    const nextCoordinates = Coordinates.plus(coordinates, unit.getDirection());
    const nextUnit = map.getUnit(nextCoordinates);
    if (nextUnit) {
      const attack: Attack = {
        sound: Sounds.SPECIAL_ATTACK,
        calculateAttackResult: (unit: Unit): AttackResult => {
          const damage = Math.round(unit.getMeleeDamage() * damageCoefficient);
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
      await attackUnit(unit, nextUnit, attack, { state, map, session });
    }

    const spawner = getSpawner(map, coordinates);
    if (spawner && spawner.isBlocking()) {
      await attackObject(unit, spawner);
    }

    const nextSpawner = getSpawner(map, nextCoordinates);
    if (nextSpawner && nextSpawner.isBlocking()) {
      await attackObject(unit, nextSpawner);
    }
  }
};
