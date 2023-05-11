import Unit from '../Unit';
import GameState from '../../../core/GameState';
import GameRenderer from '../../../graphics/renderers/GameRenderer';
import ImageFactory from '../../../graphics/images/ImageFactory';
import UnitOrder from '../orders/UnitOrder';

export type UnitControllerProps = Readonly<{
  state: GameState,
  renderer: GameRenderer,
  imageFactory: ImageFactory
}>;

export interface UnitController {
  issueOrder: (unit: Unit, { state, renderer, imageFactory }: UnitControllerProps) => UnitOrder;
}
