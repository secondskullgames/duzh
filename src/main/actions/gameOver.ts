import Sounds from '../sounds/Sounds';
import { SceneName } from '@main/scenes/SceneName';
import { Game } from '@main/core/Game';

export const gameOver = async (game: Game) => {
  const { state, session } = game;
  session.endGameTimer();
  session.setScene(SceneName.GAME_OVER);
  state.getMusicController().stop();
  state.getSoundPlayer().playSound(Sounds.GAME_OVER);
};
