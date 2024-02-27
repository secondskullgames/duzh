import { type UnitAbility } from './UnitAbility';
import { AbilityName } from './AbilityName';
import Sounds from '../../../sounds/Sounds';
import { moveUnit } from '@main/actions/moveUnit';
import { Session, GameState } from '@main/core';
import { Attack, AttackResult, attackUnit } from '@main/actions/attackUnit';
import { sleep } from '@main/utils/promises';
import { isBlocked } from '@main/maps/MapUtils';
import { Coordinates, Direction, pointAt } from '@main/geometry';
import { DefendResult, getMeleeDamage, Unit } from '@main/entities/units';

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

const _doKnockback = async (
  targetUnit: Unit,
  { dx, dy }: Direction,
  session: Session,
  state: GameState
) => {
  const { x, y } = targetUnit.getCoordinates();
  const targetCoordinates = { x: x + dx, y: y + dy };
  await moveUnit(targetUnit, targetCoordinates, session, state);
};

export const DashAttack: UnitAbility = {
  name: AbilityName.DASH_ATTACK,
  manaCost,
  icon: 'icon5',
  innate: false,
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
      const blocked = isBlocked(map, targetCoordinates);
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
          if (!isBlocked(map, behindCoordinates)) {
            await _doKnockback(targetUnit, { dx, dy } as Direction, session, state);
            await moveUnit(unit, targetCoordinates, session, state);
          }
          if (i === numTiles - 1) {
            await attackUnit(unit, targetUnit, attack, session, state);
            targetUnit.setStunned(stunDuration);
          }
        } else if (!isBlocked(map, targetCoordinates)) {
          await moveUnit(unit, targetCoordinates, session, state);
        }
        await sleep(100);
      }
    }
  }
};
