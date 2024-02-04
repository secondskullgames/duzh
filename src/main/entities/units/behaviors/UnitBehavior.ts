import Unit from '../Unit';
import { GameState } from '../../../core/GameState';
import UnitOrder from '../orders/UnitOrder';
import { Session } from '../../../core/Session';

/**
 * A UnitBehavior is a unit's current "mood".  It determines what orders the unit will issue.
 */
export interface UnitBehavior {
  issueOrder: (unit: Unit, state: GameState, session: Session) => UnitOrder;
}
