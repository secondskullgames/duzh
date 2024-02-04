import { UnitBehavior } from './UnitBehavior';
import Unit from '../Unit';
import Coordinates from '../../../geometry/Coordinates';
import Pathfinder from '../../../geometry/Pathfinder';
import UnitOrder from '../orders/UnitOrder';
import { NormalAttack } from '../abilities/NormalAttack';
import { UnitAbility } from '../abilities/UnitAbility';
import { AbilityName } from '../abilities/AbilityName';
import { randChoice } from '../../../utils/random';
import { AbilityOrder } from '../orders/AbilityOrder';
import StayOrder from '../orders/StayOrder';
import { MoveOrder } from '../orders/MoveOrder';
import { abilityForName } from '../abilities/abilityForName';
import { Dash } from '../abilities/Dash';
import { GameState } from '../../../core/GameState';
import { Session } from '../../../core/Session';
import MapInstance from '../../../maps/MapInstance';

type Props = Readonly<{
  targetUnit: Unit;
}>;

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
    const mapRect = map.getRect();
    const unblockedTiles: Coordinates[] = [];

    for (let y = 0; y < mapRect.height; y++) {
      for (let x = 0; x < mapRect.width; x++) {
        const coordinates = { x, y };
        if (Coordinates.equals(coordinates, targetUnit.getCoordinates())) {
          unblockedTiles.push(coordinates);
        } else if (!map.isBlocked(coordinates)) {
          unblockedTiles.push(coordinates);
        } else {
          // blocked
        }
      }
    }

    const path: Coordinates[] = new Pathfinder(() => 1).findPath(
      unit.getCoordinates(),
      targetUnit.getCoordinates(),
      unblockedTiles
    );

    if (path.length > 1) {
      const coordinates = path[1]; // first tile is the unit's own tile
      const second = path[2];
      if (this._canDash(unit, second, map)) {
        return new AbilityOrder({
          ability: abilityForName(AbilityName.DASH),
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
    const allowedSpecialAbilityNames = [
      AbilityName.HEAVY_ATTACK,
      AbilityName.KNOCKBACK_ATTACK,
      AbilityName.MINOR_STUN_ATTACK,
      AbilityName.PIERCE,
      AbilityName.STUN_ATTACK
    ];

    const possibleAbilities = unit
      .getAbilities()
      .filter(ability => allowedSpecialAbilityNames.includes(ability.name))
      .filter(ability => unit.getMana() >= ability.manaCost);

    if (possibleAbilities.length > 0) {
      return randChoice(possibleAbilities);
    }
    return NormalAttack;
  };

  private _canDash = (
    unit: Unit,
    coordinates: Coordinates | undefined,
    map: MapInstance
  ) => {
    if (!unit.hasAbility(AbilityName.DASH) || unit.getMana() < Dash.manaCost) {
      return false;
    }

    if (coordinates) {
      const plusOne = Coordinates.plus(unit.getCoordinates(), unit.getDirection());
      const plusTwo = Coordinates.plus(plusOne, unit.getDirection());
      return (
        map.contains(plusOne) &&
        map.contains(plusTwo) &&
        !map.isBlocked(plusOne) &&
        !map.isBlocked(plusTwo) &&
        Coordinates.equals(coordinates, plusTwo)
      );
    }
    return false;
  };
}
