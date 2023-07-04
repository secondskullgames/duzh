import Unit from '../Unit';
import UnitOrder from '../orders/UnitOrder';
import { GlobalContext } from '../../../core/GlobalContext';

export interface UnitController {
  issueOrder: (
    unit: Unit,
    context: GlobalContext
  ) => UnitOrder;
}
