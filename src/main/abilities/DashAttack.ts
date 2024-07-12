import { type UnitAbility } from './UnitAbility';
import { AbilityName } from './AbilityName';
import Unit, { DefendResult } from '@main/units/Unit';
import { getMeleeDamage } from '@main/units/UnitUtils';
import Sounds from '@main/sounds/Sounds';
import { Direction } from '@lib/geometry/Direction';
import { Coordinates } from '@lib/geometry/Coordinates';
import { offsetsToDirection, pointAt } from '@lib/geometry/CoordinatesUtils';
import { moveUnit } from '@main/actions/moveUnit';
import { Session } from '@main/core/Session';
import { GameState } from '@main/core/GameState';
import { Attack, AttackResult, attackUnit } from '@main/actions/attackUnit';
import { sleep } from '@lib/utils/promises';
import { getEnemyUnit, isBlocked } from '@main/maps/MapUtils';

const manaCost = 10;
const damageCoefficient = 1;
const stunDuration = 1;

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
    return `${attackerName} hit ${defenderName} for ${damage} damage!`;
  }
};

export const DashAttack: UnitAbility = {
  name: AbilityName.DASH_ATTACK,
  manaCost,
  icon: 'icon5',
  innate: false,
  isEnabled: unit => unit.getMana() >= manaCost,
  /**
   * It's legal if:
   * a) there's a unit one tile away, and the next tile is unblocked
   * b) there's a unit two tiles away
   * c) both tiles are unblocked
   */
  isLegal: (unit, coordinates) => {
    const map = unit.getMap();
    const direction = pointAt(unit.getCoordinates(), coordinates);
    const onePlus = Coordinates.plusDirection(unit.getCoordinates(), direction);
    const twoPlus = Coordinates.plusDirection(onePlus, direction);
    if (getEnemyUnit(unit, onePlus, map) && !isBlocked(twoPlus, map)) {
      return true;
    }
    if (getEnemyUnit(unit, twoPlus, map)) {
      return true;
    }
    return !isBlocked(onePlus, map) && !isBlocked(twoPlus, map);
  },
  use: async (
    unit: Unit,
    coordinates: Coordinates,
    session: Session,
    state: GameState
  ) => {
    const map = session.getMap();
    let { dx, dy } = Coordinates.difference(unit.getCoordinates(), coordinates);
    dx = Math.sign(dx);
    dy = Math.sign(dy);

    // validate
    {
      const targetCoordinates = Coordinates.plus(unit.getCoordinates(), { dx, dy });
      const isValid = map.contains(targetCoordinates);
      const blocked = isBlocked(targetCoordinates, map);
      const hasUnit = map.getUnit(targetCoordinates);
      if (!isValid || (blocked && !hasUnit)) {
        return;
      }
    }

    unit.setDirection(pointAt(unit.getCoordinates(), coordinates));
    unit.spendMana(manaCost);

    const numTiles = 2;
    for (let i = 0; i < 2; i++) {
      const { x, y } = unit.getCoordinates();
      const targetCoordinates = { x: x + dx, y: y + dy };
      if (map.contains(targetCoordinates)) {
        const targetUnit = map.getUnit(targetCoordinates);
        if (targetUnit) {
          const behindCoordinates = Coordinates.plus(targetCoordinates, { dx, dy });
          if (!isBlocked(behindCoordinates, map)) {
            const direction = offsetsToDirection({ dx, dy });
            await _doKnockback(targetUnit, direction, session, state);
            await moveUnit(unit, targetCoordinates, session, state);
          }
          if (i === numTiles - 1) {
            await attackUnit(unit, targetUnit, attack, session, state);
            targetUnit.setStunned(stunDuration);
          }
        } else if (!isBlocked(targetCoordinates, map)) {
          await moveUnit(unit, targetCoordinates, session, state);
        }
        await sleep(100);
      }
    }
  }
};

const _doKnockback = async (
  targetUnit: Unit,
  direction: Direction,
  session: Session,
  state: GameState
) => {
  const targetCoordinates = Coordinates.plusDirection(
    targetUnit.getCoordinates(),
    direction
  );
  await moveUnit(targetUnit, targetCoordinates, session, state);
};
