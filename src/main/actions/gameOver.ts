import Music from '../sounds/Music';
import { playSound } from '../sounds/playSound';
import Sounds from '../sounds/Sounds';
import GameState from '../core/GameState';
import { GameScreen } from '../core/GameScreen';
import { Session } from '../core/Session';

type Context = Readonly<{
  state: GameState;
  session: Session;
}>;

export const gameOver = async ({ session }: Context) => {
  session.setScreen(GameScreen.GAME_OVER);
  Music.stop();
  playSound(Sounds.GAME_OVER);
};
