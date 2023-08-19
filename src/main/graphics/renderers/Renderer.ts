import GameState from '../../core/GameState';
import ImageFactory from '../images/ImageFactory';
import Ticker from '../../core/Ticker';

export type RenderContext = Readonly<{
  state: GameState,
  imageFactory: ImageFactory,
  ticker: Ticker
}>;

export interface Renderer {
  render: (context: RenderContext) => Promise<void>;
}
