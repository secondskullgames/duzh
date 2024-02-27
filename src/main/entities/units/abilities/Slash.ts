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
import Activity from '@main/entities/units/Activity';
import { sleep } from '@main/utils/promises';
import type { UnitAbility } from './UnitAbility';

const manaCost = 15;
const damageCoefficient = 2;

/**
 * [1,       2,     3,     4,       5,     6,       7,       8      ]
 * [Forward, Right, Right, Forward, Right, Forward, Right,   Forward]
 * 678
 * 5@1
 * 432
 */
const actions: ('F' | 'R')[] = ['F', 'R', 'R', 'F', 'R', 'F', 'R', 'F'];

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
    return `${attackerName} hit ${defenderName} with a slash attack for ${damage} damage!`;
  }
};

export const Slash: UnitAbility = {
  name: AbilityName.SLASH,
  manaCost,
  icon: 'icon7', // TODO
  innate: false,
  use: async (
    unit: Unit,
    targetCoordinates: Coordinates, // TODO ignored
    session: Session,
    state: GameState
  ) => {
    const map = unit.getMap();
    let direction = pointAt(unit.getCoordinates(), targetCoordinates);

    let coordinates = unit.getCoordinates();
    for (const action of actions) {
      switch (action) {
        case 'F':
          coordinates = Coordinates.plus(coordinates, direction);
          break;
        case 'R':
          direction = Direction.rotateClockwise(direction);
          coordinates = Coordinates.plus(coordinates, direction);
          break;
      }
      unit.setDirection(direction);
      const targetUnit = map.getUnit(coordinates);
      if (targetUnit) {
        await attackUnit(unit, targetUnit, attack, session, state);
      } else {
        unit.setActivity(Activity.ATTACKING, 1, unit.getDirection());
        // attackUnit has a total of 200ms of sleeps
        await sleep(200);
      }
    }
    unit.setActivity(Activity.STANDING, 1, unit.getDirection());
  }
};
