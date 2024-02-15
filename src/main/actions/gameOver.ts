import { playSound } from '../sounds/playSound';
import Sounds from '../sounds/Sounds';
import { GameScreen } from '../core/GameScreen';
import { Session } from '../core/Session';
import { GameState } from '../core/GameState';

export const gameOver = async (state: GameState, session: Session) => {
  session.setScreen(GameScreen.GAME_OVER);
  state.getMusicController().stop();
  playSound(Sounds.GAME_OVER);
};
