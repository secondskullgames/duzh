import GameRenderer from '../graphics/renderers/GameRenderer';
import MapFactory from '../maps/MapFactory';
import MapInstance from '../maps/MapInstance';
import Music from '../sounds/Music';
import { playSound } from '../sounds/SoundFX';
import Sounds from '../sounds/Sounds';
import { checkNotNull } from '../utils/preconditions';
import GameState from './GameState';
import { InputHandler } from './InputHandler';
import { GameEngine } from './GameEngine';
import { Renderer } from '../graphics/renderers/Renderer';

let engine: GameEngine | null = null;
let firstMapPromise: Promise<MapInstance> | null = null;

const render = () => engine?.render();

const loadNextMap = async () => {
  const state = GameState.getInstance();
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

const preloadFirstMap = async () => {
  const state = GameState.getInstance();
  firstMapPromise = state.getNextMap();
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
  console.log('debug mode');
  const mapInstance = await MapFactory.loadMap({ type: 'generated', id: 'test' });
  // const mapInstance = await MapFactory.loadMap({ type: 'predefined', id: 'test' });
  GameState.getInstance().setMap(mapInstance);
  Music.stop();
  // Music.playFigure(Music.TITLE_THEME);
  // Music.playSuite(randChoice([SUITE_1, SUITE_2, SUITE_3]));
  await render();
};

const initialize = async (state: GameState, renderer: Renderer) => {
  const t1 = new Date().getTime();
  engine = new GameEngine({ renderer });
  GameState.setInstance(state);

  await render();
  const t2 = new Date().getTime();
  new InputHandler(engine).attachEvents((renderer as GameRenderer).getCanvas());
  console.debug(`Loaded splash screen in ${t2 - t1} ms`);
  const evilTheme = await Music.loadMusic('evil');
  Music.playMusic(evilTheme);
  await preloadFirstMap();
};

/**
 * Add any tiles the player can currently see to the map's revealed tiles list.
 */
const revealTiles = () => {
  const state = GameState.getInstance();
  const playerUnit = state.getPlayerUnit();
  const map = state.getMap();

  const radius = 3;

  const { x: playerX, y: playerY } = playerUnit.getCoordinates();
  for (let y = playerY - radius; y <= playerY + radius; y++) {
    for (let x = playerX - radius; x <= playerX + radius; x++) {
      if (!map.isTileRevealed({ x, y })) {
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

const logFatalError = (message: string, error?: Error) => {
  alert(message);
  console.error(`Fatal exception: ${message}`);
  if (error) {
    console.error(error);
  }
};

export {
  gameOver,
  initialize,
  loadNextMap,
  logFatalError,
  render,
  revealTiles,
  startGame,
  startGameDebug
};
