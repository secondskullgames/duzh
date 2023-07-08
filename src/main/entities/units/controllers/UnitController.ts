import Unit from '../Unit';
import GameState from '../../../core/GameState';
import UnitOrder from '../orders/UnitOrder';
import MapInstance from '../../../maps/MapInstance';

export type UnitControllerContext = Readonly<{
  state: GameState,
  map: MapInstance
}>;

export interface UnitController {
  issueOrder: (
    unit: Unit,
    { state, map }: UnitControllerContext
  ) => UnitOrder;
}
