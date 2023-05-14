import Unit from '../Unit';
import { isAdjacent, isInStraightLine } from '../../../maps/MapUtils';
import UnitOrder, { OrderContext } from './UnitOrder';
import { ShootArrow } from '../abilities/ShootArrow';
import { NormalAttack } from '../abilities/NormalAttack';
import { AbilityName } from '../abilities/AbilityName';
import { hasUnblockedStraightLineBetween } from '../../../utils/geometry';

type Props = Readonly<{
  targetUnit: Unit
}>;

export default class ShootUnitOrder implements UnitOrder {
  private readonly targetUnit: Unit;

  constructor({ targetUnit }: Props) {
    this.targetUnit = targetUnit;
  }

  /** @override {@link UnitOrder#execute} */
  execute = async (
    unit: Unit,
    { state, renderer, imageFactory }: OrderContext
  ) => {
    const { targetUnit } = this;

    if (this._canShoot(unit, targetUnit, { state, renderer, imageFactory })) {
      return ShootArrow.use(
        unit,
        targetUnit.getCoordinates(),
        { state, renderer, imageFactory }
      );
    }

    if (isAdjacent(unit.getCoordinates(), targetUnit.getCoordinates())) {
      return NormalAttack.use(
        unit,
        targetUnit.getCoordinates(),
        { state, renderer, imageFactory }
      );
    }
  };

  private _canShoot = (
    unit: Unit,
    targetUnit: Unit,
    context: OrderContext
  ): boolean => {
    return unit.hasAbility(AbilityName.SHOOT_ARROW)
      && unit.getMana() >= ShootArrow.manaCost
      && isInStraightLine(unit.getCoordinates(), targetUnit.getCoordinates())
      && hasUnblockedStraightLineBetween(
        unit.getCoordinates(),
        targetUnit.getCoordinates(),
        context
      );
  }
};