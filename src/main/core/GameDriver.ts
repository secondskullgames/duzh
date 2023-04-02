import GameRenderer from '../graphics/renderers/GameRenderer';
import Music from '../sounds/Music';
import { checkNotNull } from '../utils/preconditions';
import { GameEngine } from './GameEngine';
import GameState from './GameState';
import MapSpec from '../schemas/MapSpec';
import { MapSupplier } from '../maps/MapSupplier';
import MapFactory from '../maps/MapFactory';
import UnitFactory from '../entities/units/UnitFactory';

let _instance: GameDriver | null = null;

type Props = Readonly<{
  renderer: GameRenderer,
  state: GameState,
  engine: GameEngine
}>;

/**
 * Handles "top-level" lifecycle functionality
 */
export class GameDriver {
  private readonly state: GameState;
  private readonly renderer: GameRenderer;
  private readonly engine: GameEngine;

  constructor({ renderer, state, engine }: Props) {
    this.renderer = renderer;
    this.state = state;
    this.engine = engine;
  }

  showSplashScreen = async () => {
    const { engine, state } = this;
    state.reset();
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
