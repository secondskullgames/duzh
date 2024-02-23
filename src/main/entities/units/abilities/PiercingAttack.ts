import { type UnitAbility } from './UnitAbility';
import { AbilityName } from './AbilityName';
import Unit, { DefendResult } from '../Unit';
import Coordinates from '../../../geometry/Coordinates';
import { pointAt } from '../../../utils/geometry';
import Sounds from '../../../sounds/Sounds';
import { Attack, AttackResult, attackUnit } from '../../../actions/attackUnit';
import { attackObject } from '../../../actions/attackObject';
import { getSpawner } from '../../../maps/MapUtils';
import { Session } from '../../../core/Session';
import { GameState } from '../../../core/GameState';

const damageCoefficient = 1;
const attack: Attack = {
  sound: Sounds.SPECIAL_ATTACK,
  calculateAttackResult: (unit: Unit): AttackResult => {
    const damage = Math.round(unit.getMeleeDamage() * damageCoefficient);
    return { damage };
  },
  getDamageLogMessage: (attacker: Unit, defender: Unit, result: DefendResult): string => {
    const attackerName = attacker.getName();
    const defenderName = defender.getName();
    const damage = result.damageTaken;
    return `${attackerName} hit ${defenderName} for ${damage} damage!`;
  }
};

export class PiercingAttack implements UnitAbility {
  readonly name = AbilityName.PIERCE;
  readonly manaCost = 0;
  readonly icon = null;

  use = async (
    unit: Unit,
    coordinates: Coordinates | null,
    session: Session,
    state: GameState
  ) => {
    if (!coordinates) {
      throw new Error('PiercingAttack requires a target!');
    }

    const map = session.getMap();
    const direction = pointAt(unit.getCoordinates(), coordinates);
    unit.setDirection(direction);

    const targetUnit = map.getUnit(coordinates);
    if (targetUnit) {
      await attackUnit(unit, targetUnit, attack, session, state);
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
  };
}
