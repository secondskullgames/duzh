import Sounds from '../sounds/Sounds';
import { SceneName } from '@main/scenes/SceneName';
import { Game } from '@main/core/Game';

export const gameOver = async (game: Game) => {
  const { session, soundPlayer, musicController } = game;
  session.endGameTimer();
  session.setScene(SceneName.GAME_OVER);
  musicController.stop();
  soundPlayer.playSound(Sounds.GAME_OVER);
};
