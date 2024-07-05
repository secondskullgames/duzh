import Sounds from '../sounds/Sounds';
import { SceneName } from '@main/scenes/SceneName';
import { Session } from '@main/core/Session';
import { GameState } from '@main/core/GameState';

export const gameOver = async (state: GameState, session: Session) => {
  session.setScene(SceneName.GAME_OVER);
  state.getMusicController().stop();
  state.getSoundPlayer().playSound(Sounds.GAME_OVER);
};
