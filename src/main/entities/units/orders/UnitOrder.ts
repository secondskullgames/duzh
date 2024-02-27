import { GameState, Session } from '@main/core';
import { Unit } from '@main/entities/units';

/**
 * A UnitOrder is a single action that will consume the unit's turn.
 */
export default interface UnitOrder {
  execute: (unit: Unit, state: GameState, session: Session) => Promise<void>;
}
