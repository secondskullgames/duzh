import GameRenderer from '../graphics/renderers/GameRenderer';
import MapFactory from '../maps/MapFactory';
import MapInstance from '../maps/MapInstance';
import MapSpec from '../maps/MapSpec';
import { isTileRevealed } from '../maps/MapUtils';
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
    const mapInstance = await MapFactory.loadMap(mapSpec);
    state.setMap(mapInstance);
  }
};

const preloadFirstMap = async () => {
  const state = GameState.getInstance();
  const mapSpec = state.getNextMap();
  firstMapPromise = MapFactory.loadMap(mapSpec);
};

const initialize = async () => {
  const t1 = new Date().getTime();
  renderer = new GameRenderer();
  const container = document.getElementById('container') as HTMLElement;
  const canvas = renderer.getCanvas();
  container.appendChild(canvas);
  canvas.focus();

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

  const json = (await import(`../../../data/maps.json`)).default as any[];
  const maps = json.map(item => MapSpec.parse(item));
  const state = new GameState({ playerUnit, maps });

  GameState.setInstance(state);

  firstMapPromise = null;
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
  const mapInstance = await MapFactory.loadMap({ type: 'predefined', id: 'test' });
  GameState.getInstance().setMap(mapInstance);
  Music.stop();
  // Music.playFigure(Music.TITLE_THEME);
  // Music.playSuite(randChoice([SUITE_1, SUITE_2, SUITE_3]));
  await render();
};

/**
 * TODO: Is this different from initialize()?
 */
const returnToTitle = async () => {
  await _initState(); // will set state.screen = TITLE
  Music.stop();
  const evilTheme = await Music.loadMusic('evil');
  Music.playMusic(evilTheme);
  await render();
  preloadFirstMap();
};

/**
 * Add any tiles the player can currently see to the map's revealed tiles list.
 */
const revealTiles = () => {
  const state = GameState.getInstance();
  const playerUnit = state.getPlayerUnit();
  const map = state.getMap();

  const radius = 3;

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
