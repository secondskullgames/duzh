import { GameScreen } from '@main/core/GameScreen';
import { Session } from '@main/core/Session';
import { GameState } from '@main/core/GameState';

export const showSplashScreen = async (state: GameState, session: Session) => {
  session.setScreen(GameScreen.TITLE);
  const musicController = state.getMusicController();
  const evilTheme = await musicController.loadMusic('evil');
  musicController.playMusic(evilTheme);
};
