import GameState from './classes/GameState';
import Renderer from './classes/Renderer';

declare global {
  let jwb: {
    state: GameState,
    renderer: Renderer,
    DEBUG: boolean
  }
}
