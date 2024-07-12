import { UnitBehavior } from './UnitBehavior';
import { UnitOrder } from '@main/units/orders/UnitOrder';
import { StayOrder } from '@main/units/orders/StayOrder';

export default class StayBehavior implements UnitBehavior {
  /** @override {@link UnitBehavior#issueOrder} */
  issueOrder = (): UnitOrder => {
    return StayOrder.create();
  };
}
