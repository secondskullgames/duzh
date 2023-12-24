import GameState from '../../core/GameState';
import { Session } from '../../core/Session';

export type RenderContext = Readonly<{
  state: GameState;
  session: Session;
}>;

export interface Renderer {
  render: (context: RenderContext) => Promise<void>;
}
