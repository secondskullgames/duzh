import Music from '../sounds/Music';
import { playSound } from '../sounds/SoundFX';
import Sounds from '../sounds/Sounds';
import GameState from './GameState';

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
  logFatalError,
  revealTiles
};
