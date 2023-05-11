import Unit from '../Unit';
import { UnitController, type UnitControllerProps } from './UnitController';
import StayOrder from '../orders/StayOrder';
import UnitOrder from '../orders/UnitOrder';

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
  issueOrder = (unit: Unit, { state, renderer }: UnitControllerProps): UnitOrder => {
    if (this.queuedOrder) {
      const queuedOrder = this.queuedOrder;
      this.queuedOrder = null;
      return queuedOrder;
    }
    return new StayOrder();
  };
}
