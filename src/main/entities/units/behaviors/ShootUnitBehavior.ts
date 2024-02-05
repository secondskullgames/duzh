import AttackUnitBehavior from './AttackUnitBehavior';
import { UnitBehavior } from './UnitBehavior';
import Unit from '../Unit';
import UnitOrder from '../orders/UnitOrder';
import { ShootArrow } from '../abilities/ShootArrow';
import { isInStraightLine, manhattanDistance } from '../../../maps/MapUtils';
import { hasUnblockedStraightLineBetween, pointAt } from '../../../utils/geometry';
import { AbilityOrder } from '../orders/AbilityOrder';
import Coordinates from '../../../geometry/Coordinates';
import { GameState } from '../../../core/GameState';
import { Session } from '../../../core/Session';
import MapInstance from '../../../maps/MapInstance';

type Props = Readonly<{
  targetUnit: Unit;
}>;

export default class ShootUnitBehavior implements UnitBehavior {
  private readonly targetUnit: Unit;

  constructor({ targetUnit }: Props) {
    this.targetUnit = targetUnit;
  }

  /** @override {@link UnitBehavior#issueOrder} */
  issueOrder = (unit: Unit, state: GameState, session: Session): UnitOrder => {
    const { targetUnit } = this;
    const map = session.getMap();

    if (
      manhattanDistance(unit.getCoordinates(), targetUnit.getCoordinates()) > 1 &&
      this._canShoot(unit, targetUnit, map)
    ) {
      const direction = pointAt(unit.getCoordinates(), targetUnit.getCoordinates());
      const coordinates = Coordinates.plus(unit.getCoordinates(), direction);
      return new AbilityOrder({
        coordinates,
        ability: ShootArrow
      });
    }

    // TODO - instantiating this here is a hack
    return new AttackUnitBehavior({ targetUnit }).issueOrder(unit, state, session);
  };

  private _canShoot = (unit: Unit, targetUnit: Unit, map: MapInstance): boolean => {
    return (
      unit.getEquipment().getBySlot('RANGED_WEAPON') !== null &&
      unit.getMana() >= ShootArrow.manaCost &&
      isInStraightLine(unit.getCoordinates(), targetUnit.getCoordinates()) &&
      hasUnblockedStraightLineBetween(
        unit.getCoordinates(),
        targetUnit.getCoordinates(),
        map
      )
    );
  };
}
