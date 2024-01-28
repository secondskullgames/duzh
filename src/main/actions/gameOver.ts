import Music from '../sounds/Music';
import { playSound } from '../sounds/playSound';
import Sounds from '../sounds/Sounds';
import { GameScreen } from '../core/GameScreen';
import { Session } from '../core/Session';

export const gameOver = async (session: Session) => {
  session.setScreen(GameScreen.GAME_OVER);
  Music.stop();
  playSound(Sounds.GAME_OVER);
};
