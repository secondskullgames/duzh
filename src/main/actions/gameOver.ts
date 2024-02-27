import Sounds from '../sounds/Sounds';
import { GameScreen } from '@main/core/GameScreen';
import { Session } from '@main/core/Session';
import { GameState } from '@main/core/GameState';

export const gameOver = async (state: GameState, session: Session) => {
  session.setScreen(GameScreen.GAME_OVER);
  state.getMusicController().stop();
  state.getSoundPlayer().playSound(Sounds.GAME_OVER);
};
