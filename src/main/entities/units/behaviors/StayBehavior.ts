import Unit from '../Unit';
import UnitOrder from '../orders/UnitOrder';
import StayOrder from '../orders/StayOrder';
import { UnitBehavior, type UnitBehaviorContext } from './UnitBehavior';

export default class StayBehavior implements UnitBehavior {
  /** @override {@link UnitBehavior#issueOrder} */
  issueOrder = (
    unit: Unit,
    { state }: UnitBehaviorContext
  ): UnitOrder => {
    return new StayOrder();
  };
}