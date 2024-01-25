import Unit from '../Unit';
import GameState from '../../../core/GameState';
import UnitOrder from '../orders/UnitOrder';
import MapInstance from '../../../maps/MapInstance';
import { Session } from '../../../core/Session';

export type UnitControllerContext = Readonly<{
  state: GameState;
  session: Session;
  map: MapInstance;
}>;

export interface UnitController {
  issueOrder: (unit: Unit, context: UnitControllerContext) => UnitOrder;
}
