import GameState from './GameState';
import Renderer from '../graphics/Renderer';

declare global {
  let jwb: {
    state: GameState,
    renderer: Renderer,
    DEBUG: boolean
  }
}
