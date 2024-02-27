import { UnitOrder } from '@main/entities/units/orders';
import { GameState, Session } from '@main/core';
import { Unit } from '@main/entities/units';

/**
 * A UnitBehavior is a unit's current "mood".  It determines what orders the unit will issue.
 */
export interface UnitBehavior {
  issueOrder: (unit: Unit, state: GameState, session: Session) => UnitOrder;
}
