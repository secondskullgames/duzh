import Unit from '../Unit';
import GameState from '../../../core/GameState';
import UnitOrder from '../orders/UnitOrder';

export type UnitBehaviorContext = Readonly<{
  state: GameState
}>;

/**
 * I can't believe it's not UnitController
 */
export interface UnitBehavior {
  issueOrder: (
    unit: Unit,
    { state }: UnitBehaviorContext
  ) => UnitOrder;
}
