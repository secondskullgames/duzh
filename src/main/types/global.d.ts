import GameState from '../core/GameState';
import Renderer from '../graphics/Renderer';
import { DebugShape } from '../core/debug';

declare global {
  let jwb: {
    state: GameState,
    renderer: Renderer,
    debug: DebugShape
    DEBUG: boolean
  };
}
