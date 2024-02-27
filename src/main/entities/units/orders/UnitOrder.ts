import Unit from '../Unit';
import { GameState } from '@main/core/GameState';
import { Session } from '@main/core/Session';

/**
 * A UnitOrder is a single action that will consume the unit's turn.
 */
export default interface UnitOrder {
  execute: (unit: Unit, state: GameState, session: Session) => Promise<void>;
}
