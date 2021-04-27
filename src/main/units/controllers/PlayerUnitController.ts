import UnitController from './UnitController';
import Unit from '../Unit';
import { PromiseSupplier } from '../../types/types';

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