import { UnitBehavior } from './UnitBehavior';
import { UnitOrder } from '../orders/UnitOrder';
import { AbilityOrder } from '../orders/AbilityOrder';
import { StayOrder } from '../orders/StayOrder';
import { MoveOrder } from '../orders/MoveOrder';
import {
  canDash,
  getNearestEnemyUnit,
  isInVisionRange
} from '../controllers/ControllerUtils';
import { AbilityName } from '@main/abilities/AbilityName';
import { NormalAttack } from '@main/abilities/NormalAttack';
import { UnitAbility } from '@main/abilities/UnitAbility';
import Unit from '@main/units/Unit';
import { randChoice } from '@lib/utils/random';
import { findPath } from '@main/maps/MapUtils';
import { pointAt } from '@lib/geometry/CoordinatesUtils';

const allowedSpecialAbilityNames = [
  AbilityName.BURNING_ATTACK,
  AbilityName.HEAVY_ATTACK,
  AbilityName.KNOCKBACK_ATTACK,
  AbilityName.MINOR_KNOCKBACK,
  AbilityName.MINOR_STUN_ATTACK,
  AbilityName.PIERCE
];

/**
 * A behavior in which the unit attacks the nearest enemy unit.  The unit will move
 * towards the target unit and use abilities as appropriate.
 */
export class AttackNearestEnemyBehavior implements UnitBehavior {
  /** @override */
  issueOrder = (unit: Unit): UnitOrder => {
    const targetUnit = getNearestEnemyUnit(unit);
    if (!targetUnit) {
      return StayOrder.create();
    }

    if (!isInVisionRange(unit, targetUnit)) {
      return StayOrder.create();
    }

    const map = unit.getMap();
    const pathToTarget = findPath(
      unit.getCoordinates(),
      targetUnit.getCoordinates(),
      map
    );

    if (pathToTarget.length > 2) {
      const second = pathToTarget[2];
      const direction = pointAt(unit.getCoordinates(), second);
      if (canDash(unit, second, map)) {
        return AbilityOrder.create({
          ability: UnitAbility.abilityForName(AbilityName.DASH),
          direction
        });
      }
    }

    if (pathToTarget.length > 1) {
      const coordinates = pathToTarget[1]; // first tile is the unit's own tile
      const unitAtPoint = map.getUnit(coordinates);
      if (unitAtPoint === null) {
        return MoveOrder.create({ coordinates });
      } else if (unitAtPoint === targetUnit) {
        const ability = this._chooseAbility(unit);
        const direction = pointAt(unit.getCoordinates(), coordinates);
        return AbilityOrder.create({ ability, direction });
      }
    }
    return StayOrder.create();
  };

  private _chooseAbility = (unit: Unit): UnitAbility => {
    const possibleAbilities = unit
      .getAbilities()
      .filter(ability => allowedSpecialAbilityNames.includes(ability.name))
      .filter(ability => unit.getMana() >= ability.manaCost);

    if (possibleAbilities.length > 0) {
      return randChoice(possibleAbilities);
    }
    return NormalAttack;
  };
}
