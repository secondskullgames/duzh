import Unit from '../Unit';
import Game from '../../../core/Game';
import UnitOrder from '../orders/UnitOrder';
import MapInstance from '../../../maps/MapInstance';

export type UnitBehaviorContext = Readonly<{
  game: Game,
  map: MapInstance
}>;

/**
 * I can't believe it's not UnitController
 */
export interface UnitBehavior {
  issueOrder: (
    unit: Unit,
    { game, map }: UnitBehaviorContext
  ) => UnitOrder;
}
