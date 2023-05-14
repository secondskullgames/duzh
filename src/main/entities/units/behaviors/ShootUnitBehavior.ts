import Unit from '../Unit';
import UnitOrder from '../orders/UnitOrder';
import { AbilityName } from '../abilities/AbilityName';
import { ShootArrow } from '../abilities/ShootArrow';
import { isInStraightLine, manhattanDistance } from '../../../maps/MapUtils';
import { hasUnblockedStraightLineBetween } from '../../../utils/geometry';
import GameState from '../../../core/GameState';
import ShootUnitOrder from '../orders/ShootUnitOrder';
import AttackUnitBehavior from './AttackUnitBehavior';
import { UnitBehavior, UnitBehaviorContext } from './UnitBehavior';

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
    { state }: UnitBehaviorContext
  ): UnitOrder => {
    const { targetUnit } = this;

    if (
      manhattanDistance(unit.getCoordinates(), targetUnit.getCoordinates()) > 1
      && this._canShoot(unit, targetUnit, { state })
    ) {
      return new ShootUnitOrder({ targetUnit });
    }

    return new AttackUnitBehavior({ targetUnit }).issueOrder(unit, { state });
  };

  private _canShoot = (
    unit: Unit,
    targetUnit: Unit,
    { state }: { state: GameState }
  ): boolean => {
    return unit.hasAbility(AbilityName.SHOOT_ARROW)
      && unit.getMana() >= ShootArrow.manaCost
      && isInStraightLine(unit.getCoordinates(), targetUnit.getCoordinates())
      && hasUnblockedStraightLineBetween(
        unit.getCoordinates(),
        targetUnit.getCoordinates(),
        { state }
      );
  }
}