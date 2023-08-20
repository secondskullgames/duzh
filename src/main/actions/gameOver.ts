import Music from '../sounds/Music';
import { playSound } from '../sounds/playSound';
import Sounds from '../sounds/Sounds';
import Game from '../core/Game';
import { GameScreen } from '../core/GameScreen';

type Context = Readonly<{
  game: Game
}>;

export const gameOver = async ({ game }: Context) => {
  game.setScreen(GameScreen.GAME_OVER);
  Music.stop();
  playSound(Sounds.GAME_OVER);
};