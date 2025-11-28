import { Coordinates, Direction, pointAt } from '@duzh/geometry';
import { Attack, AttackResult, attackUnit } from '@main/actions/attackUnit';
import { Game } from '@main/core/Game';
import { StatusEffect } from '@main/units/effects/StatusEffect';
import Unit, { DefendResult } from '@main/units/Unit';
import { getMeleeDamage } from '@main/units/UnitUtils';
import { AbilityName } from './AbilityName';
import type { UnitAbility } from './UnitAbility';

const attack: Attack = {
  sound: 'special_attack',
  calculateAttackResult: (unit: Unit): AttackResult => {
    const damage = Math.round(getMeleeDamage(unit) * Cleave.DAMAGE_COEFFICIENT);
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
  static readonly MANA_COST = 8;
  static readonly DAMAGE_COEFFICIENT = 2;
  readonly name = AbilityName.CLEAVE;
  manaCost = Cleave.MANA_COST;
  readonly icon = 'icon7';
  readonly innate = false;

  isEnabled = (unit: Unit) =>
    unit.getMana() >= this.manaCost ||
    unit.getEffects().getDuration(StatusEffect.OVERDRIVE) > 0;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  isLegal = (unit: Unit, coordinates: Coordinates) => {
    return _getTargetUnits(unit).length > 0;
  };

  use = async (unit: Unit, coordinates: Coordinates, game: Game) => {
    const initialDirection = pointAt(unit.getCoordinates(), coordinates);
    unit.setDirection(initialDirection);

    const targetUnits = _getTargetUnits(unit);
    if (targetUnits.length > 0) {
      if (unit.getEffects().getDuration(StatusEffect.OVERDRIVE) === 0) {
        unit.spendMana(this.manaCost);
      }
    }

    // TODO: consider making this simultaneous
    for (const targetUnit of targetUnits) {
      const direction = pointAt(unit.getCoordinates(), targetUnit.getCoordinates());
      unit.setDirection(direction);
      await attackUnit(unit, targetUnit, attack, game);
    }
    unit.setDirection(initialDirection);
  };
}

/**
 * Returns the units that will be affected by a cleave attack.
 * Specifically, this means the unit directly ahead of the
 * attacking unit, plus any units to the left or right of that
 * unit.
 */
const _getTargetUnits = (unit: Unit): Unit[] => {
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
