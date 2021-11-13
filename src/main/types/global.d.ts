import GameState from '../core/GameState';
import { DebugShape } from '../core/debug';

declare global {
  let jwb: {
    debug: DebugShape
    DEBUG: boolean
  };
}
