import Music from '../sounds/Music';
import { playSound } from '../sounds/playSound';
import Sounds from '../sounds/Sounds';
import { GameScreen } from '../core/GameScreen';
import { GlobalContext } from '../core/GlobalContext';

export const gameOver = async ({ state }: GlobalContext) => {
  state.setScreen(GameScreen.GAME_OVER);
  Music.stop();
  playSound(Sounds.GAME_OVER);
};