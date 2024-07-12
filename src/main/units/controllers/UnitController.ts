import { UnitOrder } from '../orders/UnitOrder';
import Unit from '@main/units/Unit';

export interface UnitController {
  issueOrder: (unit: Unit) => UnitOrder;
}
