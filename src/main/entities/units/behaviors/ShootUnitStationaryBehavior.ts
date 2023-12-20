import { UnitBehavior, UnitBehaviorContext } from './UnitBehavior';
import Unit from '../Unit';
import UnitOrder from '../orders/UnitOrder';
import { isInStraightLine } from '../../../maps/MapUtils';
import { hasUnblockedStraightLineBetween, pointAt } from '../../../utils/geometry';
import { AbilityOrder } from '../orders/AbilityOrder';
import Coordinates from '../../../geometry/Coordinates';
import StayOrder from '../orders/StayOrder';
import { ShootTurretArrow } from '../abilities/ShootTurretArrow';

type Props = Readonly<{
  targetUnit: Unit;
}>;

export default class ShootUnitStationaryBehavior implements UnitBehavior {
  private readonly targetUnit: Unit;

  constructor({ targetUnit }: Props) {
    this.targetUnit = targetUnit;
  }

  /** @override {@link UnitBehavior#issueOrder} */
  issueOrder = (unit: Unit, { map }: UnitBehaviorContext): UnitOrder => {
    const { targetUnit } = this;

    if (this._canShoot(unit, targetUnit, { map })) {
      const direction = pointAt(unit.getCoordinates(), targetUnit.getCoordinates());
      const coordinates = Coordinates.plus(unit.getCoordinates(), direction);
      return new AbilityOrder({
        coordinates,
        ability: ShootTurretArrow
      });
    }

    return new StayOrder();
  };

  private _canShoot = (
    unit: Unit,
    targetUnit: Unit,
    { map }: Pick<UnitBehaviorContext, 'map'>
  ): boolean => {
    return (
      unit.getMana() >= ShootTurretArrow.manaCost &&
      isInStraightLine(unit.getCoordinates(), targetUnit.getCoordinates()) &&
      hasUnblockedStraightLineBetween(
        unit.getCoordinates(),
        targetUnit.getCoordinates(),
        { map }
      )
    );
  };
}
