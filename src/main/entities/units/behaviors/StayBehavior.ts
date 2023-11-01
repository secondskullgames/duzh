import { UnitBehavior } from './UnitBehavior';
import UnitOrder from '../orders/UnitOrder';
import StayOrder from '../orders/StayOrder';

export default class StayBehavior implements UnitBehavior {
  /** @override {@link UnitBehavior#issueOrder} */
  issueOrder = (): UnitOrder => {
    return new StayOrder();
  };
}