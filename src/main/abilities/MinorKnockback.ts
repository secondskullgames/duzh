import { type UnitAbility } from './UnitAbility';
import { AbilityName } from './AbilityName';
import Unit, { DefendResult } from '@main/units/Unit';
import { getMeleeDamage } from '@main/units/UnitUtils';
import Sounds from '@main/sounds/Sounds';
import { Coordinates } from '@lib/geometry/Coordinates';
import { pointAt } from '@lib/geometry/CoordinatesUtils';
import { moveUnit } from '@main/actions/moveUnit';
import { Attack, AttackResult, attackUnit } from '@main/actions/attackUnit';
import { isBlocked } from '@main/maps/MapUtils';
import { Engine } from '@main/core/Engine';

const damageCoefficient = 0.5;

export class MinorKnockback implements UnitAbility {
  readonly name = AbilityName.MINOR_KNOCKBACK;
  readonly manaCost = 8;
  readonly icon = 'icon6';
  readonly innate = false;

  constructor(private readonly engine: Engine) {}

  isEnabled = (unit: Unit) => unit.getMana() >= this.manaCost;

  use = async (unit: Unit, coordinates: Coordinates) => {
    const state = this.engine.getState();
    const session = this.engine.getSession();
    const map = session.getMap();
    const direction = pointAt(unit.getCoordinates(), coordinates);

    unit.setDirection(direction);

    const targetUnit = map.getUnit(coordinates);
    if (targetUnit) {
      unit.spendMana(this.manaCost);

      const attack: Attack = {
        sound: Sounds.SPECIAL_ATTACK,
        calculateAttackResult: (unit: Unit): AttackResult => {
          const damage = Math.round(getMeleeDamage(unit) * damageCoefficient);
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
          return `${attackerName} hit ${defenderName} for ${damage} damage!  ${defenderName} recoils!`;
        }
      };
      await attackUnit(unit, targetUnit, attack, session, state);

      if (targetUnit.getLife() > 0) {
        const first = Coordinates.plusDirection(targetUnit.getCoordinates(), direction);
        if (map.contains(first) && !isBlocked(map, first)) {
          await moveUnit(targetUnit, first, session, state);
        }
      }
    }
  };
}
