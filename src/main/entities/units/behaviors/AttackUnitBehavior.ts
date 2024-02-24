import { UnitBehavior } from './UnitBehavior';
import Unit from '../Unit';
import UnitOrder from '../orders/UnitOrder';
import { NormalAttack } from '../abilities/NormalAttack';
import { UnitAbility } from '../abilities/UnitAbility';
import { AbilityName } from '../abilities/AbilityName';
import { randChoice } from '../../../utils/random';
import { AbilityOrder } from '../orders/AbilityOrder';
import StayOrder from '../orders/StayOrder';
import { MoveOrder } from '../orders/MoveOrder';
import { GameState } from '../../../core/GameState';
import { Session } from '../../../core/Session';
import { findPath } from '../../../maps/MapUtils';
import { canDash } from '../controllers/ControllerUtils';

type Props = Readonly<{
  targetUnit: Unit;
}>;

const allowedSpecialAbilityNames = [
  AbilityName.HEAVY_ATTACK,
  AbilityName.KNOCKBACK_ATTACK,
  AbilityName.MINOR_STUN_ATTACK,
  AbilityName.PIERCE,
  AbilityName.STUN_ATTACK
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
  issueOrder = (unit: Unit, _: GameState, session: Session): UnitOrder => {
    const { targetUnit } = this;
    const map = session.getMap();
    const pathToTarget = findPath(
      unit.getCoordinates(),
      targetUnit.getCoordinates(),
      map
    );

    if (pathToTarget.length > 1) {
      const coordinates = pathToTarget[1]; // first tile is the unit's own tile
      const second = pathToTarget[2];
      if (canDash(unit, second, map)) {
        return new AbilityOrder({
          ability: UnitAbility.abilityForName(AbilityName.DASH),
          coordinates: second
        });
      }
      const unitAtPoint = map.getUnit(coordinates);
      if (unitAtPoint === null) {
        return new MoveOrder({ coordinates });
      } else if (unitAtPoint === targetUnit) {
        const ability = this._chooseAbility(unit);
        return new AbilityOrder({ ability, coordinates });
      }
    }
    return new StayOrder();
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
