import Game from '../../core/Game';
import ImageFactory from '../images/ImageFactory';
import Ticker from '../../core/Ticker';

export type RenderContext = Readonly<{
  game: Game,
  imageFactory: ImageFactory,
  ticker: Ticker
}>;

export interface Renderer {
  render: (context: RenderContext) => Promise<void>;
}
