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
import { Engine } from '@main/core/Engine';

const damageCoefficient = 1;
const stunDuration = 1;
const range = 10;
const sleepDuration = 75;

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

export class Scorpion implements UnitAbility {
  readonly name = AbilityName.SCORPION;
  readonly manaCost = 10;
  readonly icon = 'scorpion_icon';
  readonly innate = false;

  constructor(private readonly engine: Engine) {}

  isEnabled = (unit: Unit) => unit.getMana() >= this.manaCost;

  use = async (unit: Unit, coordinates: Coordinates) => {
    const state = this.engine.getState();
    const session = this.engine.getSession();
    const map = unit.getMap();
    const direction = pointAt(unit.getCoordinates(), coordinates);
    const { dx, dy } = Direction.getOffsets(direction);
    unit.setDirection(direction);
    const targetUnit = this._findTargetUnit(unit, direction);
    unit.spendMana(this.manaCost);
    const projectile = await state
      .getProjectileFactory()
      .createArrow(coordinates, map, direction);
    map.addProjectile(projectile);

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
  };

  private _findTargetUnit = (unit: Unit, direction: Direction): Unit | null => {
    const map = unit.getMap();
    let coordinates = Coordinates.plusDirection(unit.getCoordinates(), direction);
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
      coordinates = Coordinates.plusDirection(coordinates, direction);
    }
    return null;
  };
}
