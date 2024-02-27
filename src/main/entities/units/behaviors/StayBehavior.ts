import { UnitBehavior } from './UnitBehavior';
import { UnitOrder, StayOrder } from '@main/entities/units/orders';

export default class StayBehavior implements UnitBehavior {
  /** @override {@link UnitBehavior#issueOrder} */
  issueOrder = (): UnitOrder => {
    return new StayOrder();
  };
}
