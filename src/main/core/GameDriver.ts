import GameRenderer from '../graphics/renderers/GameRenderer';
import { InputHandler } from '../input/InputHandler';
import Music from '../sounds/Music';
import { checkNotNull } from '../utils/preconditions';
import { GameEngine } from './GameEngine';
import GameState from './GameState';

let _instance: GameDriver | null = null;

type Props = Readonly<{
  renderer: GameRenderer,
  state: GameState
}>;

/**
 * Handles "top-level" lifecycle functionality
 */
export class GameDriver {
  private readonly state: GameState;
  private readonly renderer: GameRenderer;
  private readonly engine: GameEngine;
  private readonly inputHandler: InputHandler;

  constructor({ renderer, state }: Props) {
    this.renderer = renderer;
    this.state = state;
    this.engine = new GameEngine({ state, renderer });
    this.inputHandler = new InputHandler({
      state,
      engine: this.engine,
      driver: this
    });
    this.inputHandler.addEventListener((renderer as GameRenderer).getCanvas());
  }

  showSplashScreen = async () => {
    const { engine } = this;
    await engine.render();
    const evilTheme = await Music.loadMusic('evil');
    Music.playMusic(evilTheme);
    await engine.preloadFirstMap();
  };

  getState = () => this.state;
  getRenderer = () => this.renderer;
  getEngine = () => this.engine;

  /**
   * @deprecated
   */
  static getInstance = (): GameDriver => checkNotNull(_instance);
  static setInstance = (instance: GameDriver) => { _instance = instance; };
}
