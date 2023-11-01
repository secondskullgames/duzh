import AttackUnitBehavior from './AttackUnitBehavior';
import { UnitBehavior, UnitBehaviorContext } from './UnitBehavior';
import Unit from '../Unit';
import UnitOrder from '../orders/UnitOrder';
import { ShootArrow } from '../abilities/ShootArrow';
import { isInStraightLine, manhattanDistance } from '../../../maps/MapUtils';
import { hasUnblockedStraightLineBetween, pointAt } from '../../../utils/geometry';
import { AbilityOrder } from '../orders/AbilityOrder';
import Coordinates from '../../../geometry/Coordinates';

type Props = Readonly<{
  targetUnit: Unit
}>;

export default class ShootUnitBehavior implements UnitBehavior {
  private readonly targetUnit: Unit;

  constructor({ targetUnit }: Props) {
    this.targetUnit = targetUnit;
  }

  /** @override {@link UnitBehavior#issueOrder} */
  issueOrder = (
    unit: Unit,
    { state, map }: UnitBehaviorContext
  ): UnitOrder => {
    const { targetUnit } = this;

    if (
      manhattanDistance(unit.getCoordinates(), targetUnit.getCoordinates()) > 1
      && this._canShoot(unit, targetUnit, { map })
    ) {
      const direction = pointAt(unit.getCoordinates(), targetUnit.getCoordinates());
      const coordinates = Coordinates.plus(unit.getCoordinates(), direction);
      return new AbilityOrder({
        coordinates,
        ability: ShootArrow
      });
    }

    return new AttackUnitBehavior({ targetUnit }).issueOrder(unit, { state, map });
  };

  private _canShoot = (
    unit: Unit,
    targetUnit: Unit,
    { map }: Pick<UnitBehaviorContext, 'map'>
  ): boolean => {
    return unit.getEquipment().getBySlot('RANGED_WEAPON') !== null
      && unit.getMana() >= ShootArrow.manaCost
      && isInStraightLine(unit.getCoordinates(), targetUnit.getCoordinates())
      && hasUnblockedStraightLineBetween(
        unit.getCoordinates(),
        targetUnit.getCoordinates(),
        { map }
      );
  }
}