import Unit from '../Unit';
import GameState from '../../../core/GameState';
import UnitOrder from '../orders/UnitOrder';

export type UnitControllerProps = Readonly<{
  state: GameState
}>;

export interface UnitController {
  issueOrder: (unit: Unit, { state }: UnitControllerProps) => UnitOrder;
}
