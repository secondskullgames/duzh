import GameState from './classes/GameState';
import SpriteRenderer from './classes/SpriteRenderer';

declare global {
  let jwb: {
    state: GameState,
    renderer: SpriteRenderer,
    DEBUG: boolean
  }
}
