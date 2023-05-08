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

let INSTANCE: GameEngine | null = null;

type Props = Readonly<{
  renderer: Renderer,
  state: GameState
}>;

export class GameEngine {
  private readonly state: GameState;

  private firstMapPromise: Promise<MapInstance> | null;

  constructor({ state }: Props) {
    this.state = state;
    this.firstMapPromise = null;
  }

  preloadFirstMap = async () => {
    this.firstMapPromise = this.state.loadNextMap();
    await this.firstMapPromise;
  };

  startGame = async () => {
    const t1 = new Date().getTime();
    const firstMap = await checkNotNull(this.firstMapPromise);
    this.state.setMap(firstMap);
    Music.stop();
    // Music.playSuite(randChoice([SUITE_1, SUITE_2, SUITE_3]));
    updateRevealedTiles({ state: this.state });
    await GameRenderer.getInstance().render();
    const t2 = new Date().getTime();
    console.debug(`Loaded level in ${t2 - t1} ms`);
  };

  startGameDebug = async (mapInstance: MapInstance) => {
    console.log('debug mode');
    this.state.setMap(mapInstance);
    Music.stop();
    // Music.playFigure(Music.TITLE_THEME);
    // Music.playSuite(randChoice([SUITE_1, SUITE_2, SUITE_3]));
    updateRevealedTiles({ state: this.state });
    await GameRenderer.getInstance().render();
  };

  loadNextMap = async () => {
    const { state } = this;
    if (!state.hasNextMap()) {
      Music.stop();
      state.setScreen(GameScreen.VICTORY);
    } else {
      const t1 = new Date().getTime();
      const nextMap = await state.loadNextMap();
      state.setMap(nextMap);
      updateRevealedTiles({ state: this.state })
      if (nextMap.music) {
        await Music.playMusic(nextMap.music);
      }
      const t2 = new Date().getTime();
      console.debug(`Loaded level in ${t2 - t1} ms`);
    }
  };

  static setInstance = (instance: GameEngine) => { INSTANCE = instance; };
  static getInstance = (): GameEngine => checkNotNull(INSTANCE);
}
