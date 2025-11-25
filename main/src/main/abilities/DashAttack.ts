import { type UnitAbility } from './UnitAbility';
import { AbilityName } from './AbilityName';
import Unit, { DefendResult } from '@main/units/Unit';
import { getMeleeDamage } from '@main/units/UnitUtils';
import { Coordinates, Direction, offsetsToDirection, pointAt } from '@duzh/geometry';
import { moveUnit } from '@main/actions/moveUnit';
import { Attack, AttackResult, attackUnit } from '@main/actions/attackUnit';
import { sleep } from '@lib/utils/promises';
import { getEnemyUnit, isBlocked } from '@main/maps/MapUtils';
import { Game } from '@main/core/Game';

const attack: Attack = {
  sound: 'special_attack',
  calculateAttackResult: (unit: Unit): AttackResult => {
    const damage = Math.round(getMeleeDamage(unit) * DashAttack.DAMAGE_COEFFICIENT);
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
  static readonly MANA_COST = 10;
  static readonly DAMAGE_COEFFICIENT = 1;
  static readonly STUN_DURATION = 1;
  readonly name = AbilityName.DASH_ATTACK;
  manaCost = DashAttack.MANA_COST;
  readonly icon = 'icon5';
  readonly innate = false;
  readonly isEnabled = (unit: Unit) => unit.getMana() >= this.manaCost;

  /**
   * It's legal if:
   * a) there's a unit one tile away, and the next tile is unblocked
   * b) there's a unit two tiles away
   * c) both tiles are unblocked
   */
  isLegal = (unit: Unit, coordinates: Coordinates) => {
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
  };

  use = async (unit: Unit, coordinates: Coordinates, game: Game) => {
    const map = unit.getMap();
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
    unit.spendMana(this.manaCost);

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
            await _doKnockback(targetUnit, direction, game);
            await moveUnit(unit, targetCoordinates, game);
          }
          if (i === numTiles - 1) {
            await attackUnit(unit, targetUnit, attack, game);
            targetUnit.setStunned(DashAttack.STUN_DURATION);
          }
        } else if (!isBlocked(targetCoordinates, map)) {
          await moveUnit(unit, targetCoordinates, game);
        }
        await sleep(100);
      }
    }
  };
}

const _doKnockback = async (targetUnit: Unit, direction: Direction, game: Game) => {
  const targetCoordinates = Coordinates.plusDirection(
    targetUnit.getCoordinates(),
    direction
  );
  await moveUnit(targetUnit, targetCoordinates, game);
};
