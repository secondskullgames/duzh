import { UnitController } from './UnitController';
import StayOrder from '../orders/StayOrder';
import UnitOrder from '../orders/UnitOrder';

export default class PlayerUnitController implements UnitController {
  private queuedOrder: UnitOrder | null;

  constructor() {
    this.queuedOrder = null;
  }

  queueOrder = (order: UnitOrder) => {
    this.queuedOrder = order;
  };

  /**
   * @override
   */
  issueOrder = (): UnitOrder => {
    if (this.queuedOrder) {
      const queuedOrder = this.queuedOrder;
      this.queuedOrder = null;
      return queuedOrder;
    }
    return new StayOrder();
  };
}
