import Unit from '../Unit';
import UnitController from './UnitController';

type PromiseSupplier = () => Promise<void>

class PlayerUnitController implements UnitController {
  queuedOrder: PromiseSupplier | null;

  constructor() {
    this.queuedOrder = null;
  }

  issueOrder(unit: Unit): Promise<any> {
    if (!!this.queuedOrder) {
      const queuedOrder = this.queuedOrder;
      this.queuedOrder = null;
      return queuedOrder();
    }
    return Promise.resolve();
  }
}

export default PlayerUnitController;
