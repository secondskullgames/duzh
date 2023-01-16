import { checkNotNull } from '../utils/preconditions';
import GameState from './GameState';
import GameRenderer from '../graphics/renderers/GameRenderer';

/**
 * Handles "top-level" lifecycle functionality
 */
export interface GameDriver {
  initState: () => Promise<GameState>
  getRenderer: () => GameRenderer;
}

let _instance: GameDriver | null = null;

export namespace GameDriver {
  export const getInstance = (): GameDriver => checkNotNull(_instance);
  export const setInstance = (instance: GameDriver) => { _instance = instance; };
}
