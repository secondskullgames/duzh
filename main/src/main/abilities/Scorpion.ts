import { type UnitAbility } from './UnitAbility';
import { AbilityName } from './AbilityName';
import Unit, { DefendResult } from '@main/units/Unit';
import Sounds from '@main/sounds/Sounds';
import { getMeleeDamage } from '@main/units/UnitUtils';
import { Direction } from '@lib/geometry/Direction';
import { Coordinates } from '@lib/geometry/Coordinates';
import { pointAt } from '@lib/geometry/CoordinatesUtils';
import { moveUnit } from '@main/actions/moveUnit';
import { Attack, AttackResult, attackUnit } from '@main/actions/attackUnit';
import { sleep } from '@lib/utils/promises';
import { isBlocked } from '@main/maps/MapUtils';
import { Game } from '@main/core/Game';

const attack: Attack = {
  sound: Sounds.PLAYER_HITS_ENEMY,
  calculateAttackResult: (unit: Unit): AttackResult => {
    const damage = Math.round(getMeleeDamage(unit) * Scorpion.DAMAGE_COEFFICIENT);
    return { damage };
  },
  getDamageLogMessage: (attacker: Unit, defender: Unit, result: DefendResult): string => {
    const attackerName = attacker.getName();
    const defenderName = defender.getName();
    const damage = result.damageTaken;
    return `${attackerName} hit ${defenderName} for ${damage} damage!`;
  }
};

export class Scorpion implements UnitAbility {
  static readonly MANA_COST = 10;
  static readonly DAMAGE_COEFFICIENT = 1;
  static readonly STUN_DURATION = 1;
  static readonly RANGE = 10;
  readonly name = AbilityName.SCORPION;
  manaCost = Scorpion.MANA_COST;
  readonly icon = 'scorpion_icon';
  readonly innate = false;

  isEnabled = (unit: Unit) => unit.getMana() >= this.manaCost;

  isLegal = (unit: Unit, coordinates: Coordinates) => {
    const direction = pointAt(unit.getCoordinates(), coordinates);
    return this._findTargetUnit(unit, direction) !== null;
  };

  use = async (unit: Unit, coordinates: Coordinates, game: Game) => {
    const { projectileFactory } = game;
    const map = unit.getMap();
    const direction = pointAt(unit.getCoordinates(), coordinates);
    const { dx, dy } = Direction.getOffsets(direction);
    unit.setDirection(direction);
    const targetUnit = this._findTargetUnit(unit, direction);
    unit.spendMana(this.manaCost);
    const projectile = await projectileFactory.createArrow(coordinates, map, direction);
    map.addProjectile(projectile);

    for (let i = 1; i < Scorpion.RANGE; i++) {
      const currentCoordinates = Coordinates.plus(unit.getCoordinates(), {
        dx: dx * i,
        dy: dy * i
      });
      if (map.contains(currentCoordinates) && !isBlocked(currentCoordinates, map)) {
        projectile.setCoordinates(currentCoordinates);
        await sleep(75);
      } else {
        if (
          targetUnit &&
          Coordinates.equals(currentCoordinates, targetUnit.getCoordinates())
        ) {
          await attackUnit(unit, targetUnit, attack, game);
        }
        break;
      }
    }
    map.removeProjectile(projectile);
    for (let i = Scorpion.RANGE; i > 1; i--) {
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
        await moveUnit(targetUnit, previousCoordinates, game);
        await sleep(75);
      }
    }
    if (targetUnit) {
      targetUnit.setStunned(Scorpion.STUN_DURATION);
    }
  };

  private _findTargetUnit = (unit: Unit, direction: Direction): Unit | null => {
    const map = unit.getMap();
    let coordinates = Coordinates.plusDirection(unit.getCoordinates(), direction);
    for (let i = 0; i < Scorpion.RANGE; i++) {
      if (!map.contains(coordinates)) {
        return null;
      }
      const targetUnit = map.getUnit(coordinates);
      if (targetUnit) {
        return targetUnit;
      } else if (isBlocked(coordinates, map)) {
        return null;
      }
      coordinates = Coordinates.plusDirection(coordinates, direction);
    }
    return null;
  };
}
