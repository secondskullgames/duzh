import { PromiseSupplier } from '../../types/types';
import Unit from '../Unit';
import UnitController from './UnitController';

class PlayerUnitController implements UnitController {
  queuedOrder: PromiseSupplier<void> | null;

  constructor() {
    this.queuedOrder = null;
  }

  issueOrder(unit: Unit): Promise<any> {
    if (!!this.queuedOrder) {
      const { queuedOrder } = this;
      this.queuedOrder = null;
      return queuedOrder();
    }
    return Promise.resolve();
  }
}

export default PlayerUnitController;
