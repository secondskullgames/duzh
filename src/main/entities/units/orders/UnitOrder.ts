import Unit from '../Unit';
import GameState from '../../../core/GameState';
import GameRenderer from '../../../graphics/renderers/GameRenderer';
import ImageFactory from '../../../graphics/images/ImageFactory';

export type OrderContext = Readonly<{
  state: GameState,
  renderer: GameRenderer,
  imageFactory: ImageFactory
}>;

export default interface UnitOrder {
  execute: (
    unit: Unit,
    { state, renderer, imageFactory }: OrderContext
  ) => Promise<void>
};