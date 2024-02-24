import { UnitBehavior } from './UnitBehavior';
import Unit from '../Unit';
import UnitOrder from '../orders/UnitOrder';
import { hasUnblockedStraightLineBetween, pointAt } from '../../../utils/geometry';
import { AbilityOrder } from '../orders/AbilityOrder';
import Coordinates from '../../../geometry/Coordinates';
import StayOrder from '../orders/StayOrder';
import { ShootTurretArrow } from '../abilities/ShootTurretArrow';
import { GameState } from '../../../core/GameState';
import { Session } from '../../../core/Session';
import MapInstance from '../../../maps/MapInstance';
import { isInStraightLine } from '../../../geometry/CoordinatesUtils';

type Props = Readonly<{
  targetUnit: Unit;
}>;

export default class ShootUnitStationaryBehavior implements UnitBehavior {
  private readonly targetUnit: Unit;

  constructor({ targetUnit }: Props) {
    this.targetUnit = targetUnit;
  }

  /** @override {@link UnitBehavior#issueOrder} */
  issueOrder = (unit: Unit, state: GameState, session: Session): UnitOrder => {
    const { targetUnit } = this;
    const map = session.getMap();

    if (this._canShoot(unit, targetUnit, map)) {
      const direction = pointAt(unit.getCoordinates(), targetUnit.getCoordinates());
      const coordinates = Coordinates.plus(unit.getCoordinates(), direction);
      return new AbilityOrder({
        coordinates,
        ability: ShootTurretArrow
      });
    }

    return new StayOrder();
  };

  private _canShoot = (unit: Unit, targetUnit: Unit, map: MapInstance): boolean => {
    return (
      unit.getMana() >= ShootTurretArrow.manaCost &&
      isInStraightLine(unit.getCoordinates(), targetUnit.getCoordinates()) &&
      hasUnblockedStraightLineBetween(
        unit.getCoordinates(),
        targetUnit.getCoordinates(),
        map
      )
    );
  };
}
