import Unit from '../Unit';
import { UnitController } from './UnitController';
import StayOrder from '../orders/StayOrder';
import UnitOrder from '../orders/UnitOrder';
import { GlobalContext } from '../../../core/GlobalContext';

export default class PlayerUnitController implements UnitController {
  private queuedOrder: UnitOrder | null;

  constructor() {
    this.queuedOrder = null;
  }

  queueOrder = (order: UnitOrder) => {
    this.queuedOrder = order;
  }

  /**
   * @override UnitController#issueOrder
   */
  issueOrder = (unit: Unit, context: GlobalContext): UnitOrder => {
    if (this.queuedOrder) {
      const queuedOrder = this.queuedOrder;
      this.queuedOrder = null;
      return queuedOrder;
    }
    return new StayOrder();
  };
}
