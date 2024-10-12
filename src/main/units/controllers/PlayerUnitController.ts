import { UnitController } from './UnitController';
import { StayOrder } from '../orders/StayOrder';
import { UnitOrder } from '../orders/UnitOrder';
import { UnitAbility } from '@main/abilities/UnitAbility';

export default class PlayerUnitController implements UnitController {
  private queuedAbility: UnitAbility | null;
  private queuedOrder: UnitOrder | null;

  constructor() {
    this.queuedAbility = null;
    this.queuedOrder = null;
  }

  getQueuedAbility = (): UnitAbility | null => {
    return this.queuedAbility;
  };

  setQueuedAbility = (ability: UnitAbility | null): void => {
    this.queuedAbility = ability;
  };

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
    return StayOrder.create();
  };
}
