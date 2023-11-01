import Unit from '../Unit';
import GameState from '../../../core/GameState';
import UnitOrder from '../orders/UnitOrder';
import MapInstance from '../../../maps/MapInstance';

export type UnitBehaviorContext = Readonly<{
  state: GameState;
  map: MapInstance;
}>;

/**
 * I can't believe it's not UnitController
 */
export interface UnitBehavior {
  issueOrder: (unit: Unit, { state, map }: UnitBehaviorContext) => UnitOrder;
}
