import GameState from '../../core/GameState';
import ImageFactory from '../images/ImageFactory';
import { Session } from '../../core/Session';

export type RenderContext = Readonly<{
  state: GameState;
  session: Session;
  imageFactory: ImageFactory;
}>;

export interface Renderer {
  render: (context: RenderContext) => Promise<void>;
}
