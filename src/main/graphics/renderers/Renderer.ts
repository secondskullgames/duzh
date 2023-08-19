import GameState from '../../core/GameState';

export type RenderContext = Readonly<{
  state: GameState
}>;

export interface Renderer {
  render: (context: RenderContext) => Promise<void>;
}
