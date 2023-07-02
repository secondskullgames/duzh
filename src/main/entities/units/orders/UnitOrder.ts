import Unit from '../Unit';
import GameState from '../../../core/GameState';
import ImageFactory from '../../../graphics/images/ImageFactory';

export type OrderContext = Readonly<{
  state: GameState,
  imageFactory: ImageFactory
}>;

export default interface UnitOrder {
  execute: (
    unit: Unit,
    { state, imageFactory }: OrderContext
  ) => Promise<void>
};