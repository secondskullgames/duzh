import { Renderer } from '../graphics/renderers/Renderer';
import MapInstance from '../maps/MapInstance';
import Music from '../sounds/Music';
import { playSound } from '../sounds/SoundFX';
import Sounds from '../sounds/Sounds';
import Unit from '../entities/units/Unit';
import { sortBy } from '../utils/arrays';
import { checkNotNull } from '../utils/preconditions';
import GameState from './GameState';
import GameRenderer from '../graphics/renderers/GameRenderer';
import { GameScreen } from '../types/types';
import { updateRevealedTiles } from '../actions/updateRevealedTiles';
import { loadNextMap } from '../actions/loadNextMap';

let INSTANCE: GameEngine | null = null;

type Props = Readonly<{
  renderer: Renderer,
  state: GameState
}>;

export class GameEngine {
  private readonly state: GameState;

  constructor({ state }: Props) {
    this.state = state;
  }

  static setInstance = (instance: GameEngine) => { INSTANCE = instance; };
  static getInstance = (): GameEngine => checkNotNull(INSTANCE);
}
