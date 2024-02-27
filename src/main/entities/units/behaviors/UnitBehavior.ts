import Unit from '../Unit';
import UnitOrder from '../orders/UnitOrder';
import { GameState } from '@main/core/GameState';
import { Session } from '@main/core/Session';

/**
 * A UnitBehavior is a unit's current "mood".  It determines what orders the unit will issue.
 */
export interface UnitBehavior {
  issueOrder: (unit: Unit, state: GameState, session: Session) => UnitOrder;
}
