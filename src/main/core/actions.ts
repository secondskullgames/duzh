import GameRenderer from '../graphics/renderers/GameRenderer';
import { Renderer } from '../graphics/renderers/Renderer';
import { InputHandler } from '../input/InputHandler';
import Music from '../sounds/Music';
import { playSound } from '../sounds/SoundFX';
import Sounds from '../sounds/Sounds';
import { GameDriver } from './GameDriver';
import { GameEngine } from './GameEngine';
import GameState from './GameState';

let inputHandler: InputHandler | null = null;

/**
 * TODO needs refactoring, this is in a weird in-between state
 */
const initialize = async (
  state: GameState,
  renderer: Renderer,
  driver: GameDriver
): Promise<GameEngine> => {
  const t1 = new Date().getTime();
  const engine = new GameEngine({ state, renderer });
  GameEngine.setInstance(engine);
  GameState.setInstance(state);

  await engine.render();
  const t2 = new Date().getTime();
  inputHandler?.removeEventListener();
  inputHandler = new InputHandler({ engine, state, driver });
  inputHandler.addEventListener((renderer as GameRenderer).getCanvas());
  console.debug(`Loaded splash screen in ${t2 - t1} ms`);
  const evilTheme = await Music.loadMusic('evil');
  Music.playMusic(evilTheme);
  await engine.preloadFirstMap();
  return engine;
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
  logFatalError,
  revealTiles
};
