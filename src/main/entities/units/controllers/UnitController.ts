import Unit from '../Unit';
import Game from '../../../core/Game';
import UnitOrder from '../orders/UnitOrder';
import MapInstance from '../../../maps/MapInstance';

export type UnitControllerContext = Readonly<{
  game: Game,
  map: MapInstance
}>;

export interface UnitController {
  issueOrder: (
    unit: Unit,
    { game, map }: UnitControllerContext
  ) => UnitOrder;
}
