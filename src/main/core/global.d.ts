import GameState from './GameState';
import Renderer from '../graphics/Renderer';
import { DebugShape } from './debug';

declare global {
  let jwb: {
    state: GameState,
    renderer: Renderer,
    debug: DebugShape
    DEBUG: boolean
  }
}
