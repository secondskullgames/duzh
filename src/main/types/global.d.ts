import { DebugShape } from '../core/debug';

declare global {
  let jwb: {
    debug: DebugShape
    REVEAL_MAP: boolean
  };
}
