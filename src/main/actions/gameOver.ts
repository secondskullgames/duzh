import Sounds from '../sounds/Sounds';
import { SceneName } from '@main/scenes/SceneName';
import { Globals } from '@main/core/globals';

export const gameOver = async () => {
  const { session, soundPlayer, musicController } = Globals;
  session.endGameTimer();
  session.setScene(SceneName.GAME_OVER);
  musicController.stop();
  soundPlayer.playSound(Sounds.GAME_OVER);
};
