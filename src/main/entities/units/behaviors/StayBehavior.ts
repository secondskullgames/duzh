import Unit from '../Unit';
import UnitOrder from '../orders/UnitOrder';
import StayOrder from '../orders/StayOrder';
import { UnitBehavior } from './UnitBehavior';
import { GlobalContext } from '../../../core/GlobalContext';

export default class StayBehavior implements UnitBehavior {
  /** @override {@link UnitBehavior#issueOrder} */
  issueOrder = (
    unit: Unit,
    context: GlobalContext
  ): UnitOrder => {
    return new StayOrder();
  };
}