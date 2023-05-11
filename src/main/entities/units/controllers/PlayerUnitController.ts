import Unit from '../Unit';
import UnitController, { UnitControllerProps } from './UnitController';

type PromiseSupplier = () => Promise<void>

export default class PlayerUnitController implements UnitController {
  private queuedOrder: PromiseSupplier | null;

  constructor() {
    this.queuedOrder = null;
  }

  queueOrder = (order: PromiseSupplier) => {
    this.queuedOrder = order;
  }

  /**
   * @override UnitController#issueOrder
   */
  issueOrder = async (unit: Unit, { state, renderer }: UnitControllerProps) => {
    if (this.queuedOrder) {
      const queuedOrder = this.queuedOrder;
      this.queuedOrder = null;
      return queuedOrder();
    }
  };
}
