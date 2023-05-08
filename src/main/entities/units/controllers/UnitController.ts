import Unit from '../Unit';
import GameState from '../../../core/GameState';
import GameRenderer from '../../../graphics/renderers/GameRenderer';
import ImageFactory from '../../../graphics/images/ImageFactory';

export type UnitControllerProps = Readonly<{
  state: GameState,
  renderer: GameRenderer,
  imageFactory: ImageFactory
}>;

interface UnitController {
  issueOrder: (unit: Unit, { state }: UnitControllerProps) => Promise<void>;
}

export default UnitController;
