import { UnitOrder } from '../orders/UnitOrder';
import Unit from '@main/units/Unit';

/**
 * A UnitBehavior is a unit's current "mood".  It determines what orders the unit will issue.
 */
export interface UnitBehavior {
  issueOrder: (unit: Unit) => UnitOrder;
}
