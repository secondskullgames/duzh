import { Renderer } from '../graphics/renderers/Renderer';
import MapFactory from '../maps/MapFactory';
import MapInstance from '../maps/MapInstance';
import Music from '../sounds/Music';
import Unit from '../units/Unit';
import { sortBy } from '../utils/arrays';
import { checkNotNull } from '../utils/preconditions';
import GameState from './GameState';

let INSTANCE: GameEngine | null = null;

type Props = Readonly<{
  renderer: Renderer,
  state: GameState
}>;

export class GameEngine {
  private readonly renderer: Renderer;
  private readonly state: GameState;

  private firstMapPromise: Promise<MapInstance> | null;

  constructor({ state, renderer }: Props) {
    this.renderer = renderer;
    this.state = state;
    this.firstMapPromise = null;
  }

  preloadFirstMap = async () => {
    const state = GameState.getInstance();
    this.firstMapPromise = state.getNextMap();
  };

  startGame = async () => {
    const t1 = new Date().getTime();
    const firstMap = await checkNotNull(this.firstMapPromise);
    this.state.setMap(firstMap);
    Music.stop();
    // Music.playFigure(Music.TITLE_THEME);
    // Music.playSuite(randChoice([SUITE_1, SUITE_2, SUITE_3]));
    await this.renderer.render();
    const t2 = new Date().getTime();
    console.debug(`Loaded level in ${t2 - t1} ms`);
  };

  startGameDebug = async () => {
    console.log('debug mode');
    const mapInstance = await MapFactory.loadMap({ type: 'generated', id: 'test' });
    // const mapInstance = await MapFactory.loadMap({ type: 'predefined', id: 'test' });
    this.state.setMap(mapInstance);
    Music.stop();
    // Music.playFigure(Music.TITLE_THEME);
    // Music.playSuite(randChoice([SUITE_1, SUITE_2, SUITE_3]));
    await this.renderer.render();
  };

  playTurn = async () => {
    const { state } = this;
    const map = state.getMap();

    const sortedUnits = _sortUnits(map.units);
    for (const unit of sortedUnits) {
      await unit.update();
    }

    // TODO: update other things
    for (const spawner of map.spawners) {
      await spawner.update();
    }

    await this.renderer.render();
    state.nextTurn();
  };

  render = async () => this.renderer.render();

  loadNextMap = async () => {
    const { state } = this;
    if (!state.hasNextMap()) {
      Music.stop();
      state.setScreen('VICTORY');
    } else {
      const t1 = new Date().getTime();
      const nextMap = await state.getNextMap();
      state.setMap(nextMap);
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

/**
 * Sort the list of units such that the player unit is first in the order,
 * and other units appear in unspecified order
 */
const _sortUnits = (units: Unit[]): Unit[] => sortBy(
  units,
  unit => (unit.getFaction() === 'PLAYER') ? 0 : 1
);
