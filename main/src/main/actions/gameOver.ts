import { SceneName } from '@main/scenes/SceneName';
import { Game } from '@main/core/Game';

export const gameOver = async (game: Game) => {
  const { state, soundController, musicController } = game;
  state.endGameTimer();
  state.setScene(SceneName.GAME_OVER);
  musicController.stop();
  soundController.playSound('game_over');
};
