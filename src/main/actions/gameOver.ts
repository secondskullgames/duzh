import Music from '../sounds/Music';
import { playSound } from '../sounds/playSound';
import Sounds from '../sounds/Sounds';
import GameState from '../core/GameState';
import { GameScreen } from '../core/GameScreen';

type Context = Readonly<{
  state: GameState;
}>;

export const gameOver = async ({ state }: Context) => {
  state.setScreen(GameScreen.GAME_OVER);
  Music.stop();
  playSound(Sounds.GAME_OVER);
};
