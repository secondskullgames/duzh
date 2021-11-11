import GameState from '../core/GameState';
import BufferedRenderer from '../graphics/BufferedRenderer';
import { DebugShape } from '../core/debug';

declare global {
  let jwb: {
    state: GameState,
    debug: DebugShape
    DEBUG: boolean
  };
}
