import Unit from '../Unit';
import { GameState } from '../../../core/GameState';
import UnitOrder from '../orders/UnitOrder';
import { Session } from '../../../core/Session';

export interface UnitController {
  issueOrder: (unit: Unit, state: GameState, session: Session) => UnitOrder;
}
