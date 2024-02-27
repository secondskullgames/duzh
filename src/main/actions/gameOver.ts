import Sounds from '../sounds/Sounds';
import { GameScreen, Session, GameState } from '@main/core';

export const gameOver = async (state: GameState, session: Session) => {
  session.setScreen(GameScreen.GAME_OVER);
  state.getMusicController().stop();
  state.getSoundPlayer().playSound(Sounds.GAME_OVER);
};
