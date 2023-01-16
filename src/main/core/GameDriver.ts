import GameRenderer from '../graphics/renderers/GameRenderer';
import { checkNotNull } from '../utils/preconditions';
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

  constructor({ renderer, state }: Props) {
    this.renderer = renderer;
    this.state = state;
  }

  getState = () => this.state;
  getRenderer = () => this.renderer;

  /**
   * @deprecated
   */
  static getInstance = (): GameDriver => checkNotNull(_instance);
  static setInstance = (instance: GameDriver) => { _instance = instance; };
}
