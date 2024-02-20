import { type UnitAbility } from './UnitAbility';
import { AbilityName } from './AbilityName';
import Unit, { DefendResult } from '../Unit';
import Coordinates from '../../../geometry/Coordinates';
import { pointAt } from '../../../utils/geometry';
import Sounds from '../../../sounds/Sounds';
import { moveUnit } from '../../../actions/moveUnit';
import { Session } from '../../../core/Session';
import { GameState } from '../../../core/GameState';
import { Attack, AttackResult, attackUnit } from '../../../actions/attackUnit';
import Direction from '../../../geometry/Direction';
import { sleep } from '../../../utils/promises';

const manaCost = 10;
const damageCoefficient = 1;

const _doAttack = async (
  unit: Unit,
  targetUnit: Unit,
  session: Session,
  state: GameState
) => {
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
  await attackUnit(unit, targetUnit, attack, session, state);
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

export const DoubleDashAttack: UnitAbility = {
  name: AbilityName.DOUBLE_DASH_ATTACK,
  manaCost,
  icon: 'icon5', // TODO
  use: async (
    unit: Unit,
    coordinates: Coordinates | null,
    session: Session,
    state: GameState
  ) => {
    if (!coordinates) {
      throw new Error('DashAttack requires a target!');
    }

    const map = session.getMap();
    let { dx, dy } = Coordinates.difference(unit.getCoordinates(), coordinates);
    dx = Math.sign(dx);
    dy = Math.sign(dy);

    // validate
    {
      const targetCoordinates = Coordinates.plus(unit.getCoordinates(), { dx, dy });
      const isValid = map.contains(targetCoordinates);
      const isBlocked = map.isBlocked(targetCoordinates);
      const hasUnit = map.getUnit(targetCoordinates);
      if (!isValid || (isBlocked && !hasUnit)) {
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
          if (!map.isBlocked(behindCoordinates)) {
            await _doKnockback(targetUnit, { dx, dy } as Direction, session, state);
            await moveUnit(unit, targetCoordinates, session, state);
            if (i === numTiles - 1) {
              await _doAttack(unit, targetUnit, session, state);
            }
          }
        } else if (!map.isBlocked(targetCoordinates)) {
          await moveUnit(unit, targetCoordinates, session, state);
        }
        await sleep(100);
      }
    }
  }
};
