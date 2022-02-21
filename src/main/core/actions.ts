import GameRenderer from '../graphics/renderers/GameRenderer';
import MapFactory from '../maps/MapFactory';
import GeneratedMapModel from '../maps/generated/GeneratedMapModel';
import MapInstance from '../maps/MapInstance';
import MapSpec from '../maps/MapSpec';
import { contains, isTileRevealed } from '../maps/MapUtils';
import PredefinedMapModel from '../maps/predefined/PredefinedMapModel';
import Music from '../sounds/Music';
import { playSound } from '../sounds/SoundFX';
import Sounds from '../sounds/Sounds';
import TileSet from '../tiles/TileSet';
import UnitFactory from '../units/UnitFactory';
import { checkNotNull } from '../utils/preconditions';
import GameState from './GameState';
import { attachEvents } from './InputHandler';

let renderer: GameRenderer;
let firstMapPromise: Promise<MapInstance> | null = null;

const loadNextMap = async () => {
  const state = GameState.getInstance();
  if (!state.hasNextMap()) {
    Music.stop();
    state.setScreen('VICTORY');
  } else {
    const mapSpec = state.getNextMap();
    const mapInstance = await _loadMap(mapSpec);
    state.setMap(mapInstance);
  }
};

const preloadFirstMap = async () => {
  const state = GameState.getInstance();
  const mapSpec = state.getNextMap();
  firstMapPromise = _loadMap(mapSpec);
};

const _loadMap = (map: MapSpec): Promise<MapInstance> => {
  switch (map.type) {
    case 'generated': {
      return (async () => {
        const mapModel = await GeneratedMapModel.load(map.id);
        const mapBuilder = await MapFactory.loadGeneratedMap(mapModel);
        return mapBuilder.build();
      })();
    }
    case 'predefined': {
      return (async () => {
        const mapModel = await PredefinedMapModel.load(map.id);
        return MapFactory.loadPredefinedMap(mapModel);
      })();
    }
  }
};

const initialize = async () => {
  const t1 = new Date().getTime();
  renderer = new GameRenderer();
  const container = document.getElementById('container') as HTMLElement;
  container.appendChild(renderer.getCanvas());
  await _initState();
  await render();
  const t2 = new Date().getTime();
  preloadFirstMap();
  TileSet.preload();
  attachEvents();
  console.debug(`Loaded splash screen in ${t2 - t1} ms`);
  const evilTheme = await Music.loadMusic('evil');
  Music.playMusic(evilTheme);
};

const render = async () => renderer.render();

const _initState = async () => {
  const playerUnit = await UnitFactory.createPlayerUnit();

  const maps: MapSpec[] = [
    { type: 'generated', id: '1' },
    { type: 'generated', id: '2' },
    { type: 'generated', id: '3' },
    { type: 'generated', id: '4' },
    { type: 'generated', id: '5' },
    { type: 'generated', id: '6' }
  ];
  const state = new GameState({ playerUnit, maps });

  GameState.setInstance(state);
};

const startGame = async () => {
  const t1 = new Date().getTime();
  const firstMap = await checkNotNull(firstMapPromise);
  GameState.getInstance().setMap(firstMap);
  Music.stop();
  // Music.playFigure(Music.TITLE_THEME);
  // Music.playSuite(randChoice([SUITE_1, SUITE_2, SUITE_3]));
  await render();
  const t2 = new Date().getTime();
  console.debug(`Loaded level in ${t2 - t1} ms`);
};

const startGameDebug = async () => {
  const mapInstance = await _loadMap({ type: 'predefined', id: 'test' });
  GameState.getInstance().setMap(mapInstance);
  Music.stop();
  // Music.playFigure(Music.TITLE_THEME);
  // Music.playSuite(randChoice([SUITE_1, SUITE_2, SUITE_3]));
  await render();
};

const returnToTitle = async () => {
  await _initState(); // will set state.screen = TITLE
  Music.stop();
  const evilTheme = await Music.loadMusic('evil');
  Music.playMusic(evilTheme);
  await render();
};

/**
 * Add any tiles the player can currently see to the map's revealed tiles list.
 */
const revealTiles = () => {
  const state = GameState.getInstance();
  const playerUnit = state.getPlayerUnit();
  const map = state.getMap();

  const radius = 2;

  for (let y = playerUnit.y - radius; y <= playerUnit.y + radius; y++) {
    for (let x = playerUnit.x - radius; x <= playerUnit.x + radius; x++) {
      if (!isTileRevealed({ x, y })) {
        map.revealTile({ x, y });
      }
    }
  }
};

const gameOver = async () => {
  GameState.getInstance().setScreen('GAME_OVER');
  Music.stop();
  playSound(Sounds.GAME_OVER);
};

export {
  gameOver,
  initialize,
  loadNextMap,
  render,
  returnToTitle,
  revealTiles,
  startGame,
  startGameDebug
};
