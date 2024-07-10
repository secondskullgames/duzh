import { UnitBehavior } from './UnitBehavior';
import UnitOrder from '../orders/UnitOrder';
import { AbilityOrder } from '../orders/AbilityOrder';
import StayOrder from '../orders/StayOrder';
import { MoveOrder } from '../orders/MoveOrder';
import { canDash } from '../controllers/ControllerUtils';
import { AbilityName } from '@main/abilities/AbilityName';
import { UnitAbility } from '@main/abilities/UnitAbility';
import Unit from '@main/units/Unit';
import { randChoice } from '@lib/utils/random';
import { GameState } from '@main/core/GameState';
import { Session } from '@main/core/Session';
import { findPath } from '@main/maps/MapUtils';
import { pointAt } from '@lib/geometry/CoordinatesUtils';

type Props = Readonly<{
  targetUnit: Unit;
}>;

const allowedSpecialAbilityNames = [
  AbilityName.BURNING_ATTACK,
  AbilityName.HEAVY_ATTACK,
  AbilityName.KNOCKBACK_ATTACK,
  AbilityName.MINOR_KNOCKBACK,
  AbilityName.MINOR_STUN_ATTACK,
  AbilityName.PIERCE
];

/**
 * A behavior in which the unit attacks a target unit.  The unit will move
 * towards the target unit and use abilities as appropriate.
 */
export default class AttackUnitBehavior implements UnitBehavior {
  private readonly targetUnit: Unit;

  constructor({ targetUnit }: Props) {
    this.targetUnit = targetUnit;
  }

  /** @override */
  issueOrder = (unit: Unit, state: GameState, session: Session): UnitOrder => {
    const { targetUnit } = this;
    const map = session.getMap();
    const pathToTarget = findPath(
      unit.getCoordinates(),
      targetUnit.getCoordinates(),
      map
    );

    if (pathToTarget.length > 2) {
      const second = pathToTarget[2];
      const direction = pointAt(unit.getCoordinates(), second);
      if (canDash(unit, second, map, state)) {
        const dashAbility = state.getAbilityFactory().abilityForName(AbilityName.DASH);
        return new AbilityOrder({
          ability: dashAbility,
          direction
        });
      }
    }

    if (pathToTarget.length > 1) {
      const coordinates = pathToTarget[1]; // first tile is the unit's own tile
      const unitAtPoint = map.getUnit(coordinates);
      if (unitAtPoint === null) {
        return new MoveOrder({ coordinates });
      } else if (unitAtPoint === targetUnit) {
        const ability = this._chooseAbility(unit, state);
        const direction = pointAt(unit.getCoordinates(), coordinates);
        return new AbilityOrder({ ability, direction });
      }
    }
    return new StayOrder();
  };

  private _chooseAbility = (unit: Unit, state: GameState): UnitAbility => {
    const possibleAbilities = unit
      .getAbilities()
      .map(state.getAbilityFactory().abilityForName)
      .filter(ability => allowedSpecialAbilityNames.includes(ability.name))
      .filter(ability => unit.getMana() >= ability.manaCost);

    if (possibleAbilities.length > 0) {
      return randChoice(possibleAbilities);
    }
    return state.getAbilityFactory().abilityForName(AbilityName.ATTACK);
  };
}
