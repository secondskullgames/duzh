import Unit from '../Unit';
import GameState from '../../../core/GameState';
import UnitOrder from '../orders/UnitOrder';

export type UnitControllerContext = Readonly<{
  state: GameState
}>;

export interface UnitController {
  issueOrder: (unit: Unit, { state }: UnitControllerContext) => UnitOrder;
}
