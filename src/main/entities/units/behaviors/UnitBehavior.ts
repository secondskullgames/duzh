import Unit from '../Unit';
import GameState from '../../../core/GameState';
import UnitOrder from '../orders/UnitOrder';
import MapInstance from '../../../maps/MapInstance';

export type UnitBehaviorContext = Readonly<{
  state: GameState;
  map: MapInstance;
}>;

/**
 * A UnitBehavior is a unit's current "mood".  It determines what orders the unit will issue.
 */
export interface UnitBehavior {
  issueOrder: (unit: Unit, { state, map }: UnitBehaviorContext) => UnitOrder;
}
