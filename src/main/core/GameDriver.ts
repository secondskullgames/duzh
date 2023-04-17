import GameRenderer from '../graphics/renderers/GameRenderer';
import Music from '../sounds/Music';
import { checkNotNull } from '../utils/preconditions';
import { GameEngine } from './GameEngine';
import GameState from './GameState';

let _instance: GameDriver | null = null;

type Props = Readonly<{
  state: GameState,
  engine: GameEngine
}>;

/**
 * Handles "top-level" lifecycle functionality
 */
export class GameDriver {
  private readonly state: GameState;
  private readonly engine: GameEngine;

  constructor({ state, engine }: Props) {
    this.state = state;
    this.engine = engine;
  }

  showSplashScreen = async () => {
    const { engine, state } = this;
    state.reset();
    await GameRenderer.getInstance().render();
    const evilTheme = await Music.loadMusic('evil');
    Music.playMusic(evilTheme);
    await engine.preloadFirstMap();
  };

  /**
   * @deprecated
   */
  static getInstance = (): GameDriver => checkNotNull(_instance);
  static setInstance = (instance: GameDriver) => { _instance = instance; };
}
