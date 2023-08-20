import GameState from '../../core/GameState';
import Ticker from '../../core/Ticker';

export type RenderContext = Readonly<{
  state: GameState,
  ticker: Ticker
}>;

export interface Renderer {
  render: (context: RenderContext) => Promise<void>;
}
