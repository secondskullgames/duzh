import Unit from '../Unit';
import UnitOrder from '../orders/UnitOrder';
import { GameState, Session } from '@main/core';

export interface UnitController {
  issueOrder: (unit: Unit, state: GameState, session: Session) => UnitOrder;
}
