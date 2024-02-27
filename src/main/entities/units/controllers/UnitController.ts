import Unit from '../Unit';
import UnitOrder from '../orders/UnitOrder';
import { GameState } from '@main/core/GameState';
import { Session } from '@main/core/Session';

export interface UnitController {
  issueOrder: (unit: Unit, state: GameState, session: Session) => UnitOrder;
}
