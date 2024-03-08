import { type UnitAbility } from './UnitAbility';
import { AbilityName } from './AbilityName';
import Unit, { DefendResult } from '../Unit';
import Sounds from '../../../sounds/Sounds';
import Direction from '../../../geometry/Direction';
import { getMeleeDamage } from '../UnitUtils';
import Coordinates from '@lib/geometry/Coordinates';
import { pointAt } from '@lib/geometry/CoordinatesUtils';
import { moveUnit } from '@main/actions/moveUnit';
import { Session } from '@main/core/Session';
import { GameState } from '@main/core/GameState';
import { Attack, AttackResult, attackUnit } from '@main/actions/attackUnit';
import { sleep } from '@lib/utils/promises';
import { isBlocked } from '@main/maps/MapUtils';

const manaCost = 10;
const damageCoefficient = 1;
const stunDuration = 1;
const range = 10;

const _findTargetUnit = (unit: Unit, { dx, dy }: Direction): Unit | null => {
  const map = unit.getMap();
  let coordinates = Coordinates.plus(unit.getCoordinates(), { dx, dy });
  for (let i = 0; i < range; i++) {
    if (!map.contains(coordinates)) {
      return null;
    }
    const targetUnit = map.getUnit(coordinates);
    if (targetUnit) {
      return targetUnit;
    } else if (isBlocked(map, coordinates)) {
      return null;
    }
    coordinates = Coordinates.plus(coordinates, { dx, dy });
  }
  return null;
};

const attack: Attack = {
  sound: Sounds.PLAYER_HITS_ENEMY,
  calculateAttackResult: (unit: Unit): AttackResult => {
    const damage = Math.round(getMeleeDamage(unit) * damageCoefficient);
    return { damage };
  },
  getDamageLogMessage: (attacker: Unit, defender: Unit, result: DefendResult): string => {
    const attackerName = attacker.getName();
    const defenderName = defender.getName();
    const damage = result.damageTaken;
    return `${attackerName} hit ${defenderName} for ${damage} damage!`;
  }
};

const sleepDuration = 75;
export const Scorpion: UnitAbility = {
  name: AbilityName.SCORPION,
  manaCost,
  icon: 'scorpion_icon',
  innate: false,
  use: async (
    unit: Unit,
    coordinates: Coordinates,
    session: Session,
    state: GameState
  ) => {
    const map = unit.getMap();
    const direction = pointAt(unit.getCoordinates(), coordinates);
    const { dx, dy } = direction;
    unit.setDirection(direction);
    const targetUnit = _findTargetUnit(unit, direction);
    unit.spendMana(manaCost);
    const projectile = await state
      .getProjectileFactory()
      .createArrow(coordinates, map, direction);
    map.projectiles.add(projectile);

    for (let i = 1; i < range; i++) {
      const currentCoordinates = Coordinates.plus(unit.getCoordinates(), {
        dx: dx * i,
        dy: dy * i
      });
      if (map.contains(currentCoordinates) && !isBlocked(map, currentCoordinates)) {
        projectile.setCoordinates(currentCoordinates);
        await sleep(sleepDuration);
      } else {
        if (
          targetUnit &&
          Coordinates.equals(currentCoordinates, targetUnit.getCoordinates())
        ) {
          await attackUnit(unit, targetUnit, attack, session, state);
        }
        break;
      }
    }
    map.removeProjectile(projectile);
    for (let i = range; i > 1; i--) {
      const currentCoordinates = Coordinates.plus(unit.getCoordinates(), {
        dx: dx * i,
        dy: dy * i
      });
      if (
        targetUnit &&
        targetUnit.getLife() >= 0 &&
        Coordinates.equals(targetUnit.getCoordinates(), currentCoordinates)
      ) {
        const previousCoordinates = Coordinates.plus(unit.getCoordinates(), {
          dx: dx * (i - 1),
          dy: dy * (i - 1)
        });
        await moveUnit(targetUnit, previousCoordinates, session, state);
        await sleep(sleepDuration);
      }
    }
    if (targetUnit) {
      targetUnit.setStunned(stunDuration);
    }
  }
};
