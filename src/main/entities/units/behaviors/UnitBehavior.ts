import Unit from '../Unit';
import UnitOrder from '../orders/UnitOrder';
import { GlobalContext } from '../../../core/GlobalContext';


/**
 * I can't believe it's not UnitController
 */
export interface UnitBehavior {
  issueOrder: (
    unit: Unit,
    context: GlobalContext
  ) => UnitOrder;
}
