import GameState from '../../core/GameState';
import ImageFactory from '../images/ImageFactory';
import { Graphics } from '../Graphics';

export type RenderContext = Readonly<{
  state: GameState,
  imageFactory: ImageFactory
}>;

export interface Renderer {
  render: (context: RenderContext) => Promise<void>;
}
