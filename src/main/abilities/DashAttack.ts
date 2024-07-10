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
import { isBlocked } from '@main/maps/MapUtils';
import { Engine } from '@main/core/Engine';

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

export class DashAttack implements UnitAbility {
  readonly name = AbilityName.DASH_ATTACK;
  readonly manaCost = 10;
  readonly icon = 'icon5';
  readonly innate = false;

  constructor(private readonly engine: Engine) {}

  isEnabled = (unit: Unit) => unit.getMana() >= this.manaCost;

  use = async (unit: Unit, coordinates: Coordinates) => {
    const state = this.engine.getState();
    const session = this.engine.getSession();
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
    unit.spendMana(this.manaCost);

    const numTiles = 2;
    for (let i = 0; i < 2; i++) {
      const { x, y } = unit.getCoordinates();
      const targetCoordinates = { x: x + dx, y: y + dy };
      if (map.contains(targetCoordinates)) {
        const targetUnit = map.getUnit(targetCoordinates);
        if (targetUnit) {
          const behindCoordinates = Coordinates.plus(targetCoordinates, { dx, dy });
          if (!isBlocked(map, behindCoordinates)) {
            const direction = offsetsToDirection({ dx, dy });
            await this._doKnockback(targetUnit, direction, session, state);
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
  };

  private _doKnockback = async (
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
}
