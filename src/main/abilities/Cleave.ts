import { AbilityName } from './AbilityName';
import Unit, { DefendResult } from '@main/units/Unit';
import Sounds from '@main/sounds/Sounds';
import { getMeleeDamage } from '@main/units/UnitUtils';
import { Direction } from '@lib/geometry/Direction';
import { Coordinates } from '@lib/geometry/Coordinates';
import { pointAt } from '@lib/geometry/CoordinatesUtils';
import { Attack, AttackResult, attackUnit } from '@main/actions/attackUnit';
import { Engine } from '@main/core/Engine';
import type { UnitAbility } from './UnitAbility';

const damageCoefficient = 2;

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
    return `${attackerName} hit ${defenderName} with a heavy attack for ${damage} damage!`;
  }
};

export class Cleave implements UnitAbility {
  name = AbilityName.CLEAVE;
  manaCost = 8;
  icon = 'icon7';
  innate = false;

  constructor(private readonly engine: Engine) {}

  isEnabled = (unit: Unit) => unit.getMana() >= this.manaCost;

  use = async (unit: Unit, coordinates: Coordinates) => {
    const state = this.engine.getState();
    const session = this.engine.getSession();
    const initialDirection = pointAt(unit.getCoordinates(), coordinates);
    unit.setDirection(initialDirection);

    const targetUnits = this._getTargetUnits(unit);
    if (targetUnits.length > 0) {
      unit.spendMana(this.manaCost);
    }

    // TODO: consider making this simultaneous
    for (const targetUnit of targetUnits) {
      const direction = pointAt(unit.getCoordinates(), targetUnit.getCoordinates());
      unit.setDirection(direction);
      await attackUnit(unit, targetUnit, attack, session, state);
    }
    unit.setDirection(initialDirection);
  };

  /**
   * Returns the units that will be affected by a cleave attack.
   * Specifically, this means the unit directly ahead of the
   * attacking unit, plus any units to the left or right of that
   * unit.
   */
  private _getTargetUnits = (unit: Unit): Unit[] => {
    const map = unit.getMap();
    const coordinates = unit.getCoordinates();
    const initialDirection = unit.getDirection();
    let direction = initialDirection;
    const targetUnits: Unit[] = [];
    for (let i = 0; i < 4; i++) {
      const targetCoordinates = Coordinates.plusDirection(coordinates, direction);
      const targetUnit = map.getUnit(targetCoordinates);
      if (targetUnit) {
        targetUnits.push(targetUnit);
      }
      direction = Direction.rotateClockwise(direction);
    }
    return targetUnits;
  };
}
