import Unit from '../Unit';
import UnitController from './UnitController';

type PromiseSupplier = () => Promise<void>

export default class PlayerUnitController implements UnitController {
  queuedOrder: PromiseSupplier | null;

  private static INSTANCE = new PlayerUnitController();

  constructor() {
    this.queuedOrder = null;
  }

  issueOrder = async (unit: Unit) => {
    if (this.queuedOrder) {
      const queuedOrder = this.queuedOrder;
      this.queuedOrder = null;
      return queuedOrder();
    }
  };

  static getInstance = () => PlayerUnitController.INSTANCE;
}
