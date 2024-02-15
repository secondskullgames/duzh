import { GameScreen } from '../core/GameScreen';
import { Session } from '../core/Session';
import { GameState } from '../core/GameState';

export const showSplashScreen = async (state: GameState, session: Session) => {
  session.setScreen(GameScreen.TITLE);
  const musicController = state.getMusicController();
  const evilTheme = await musicController.loadMusic('evil');
  musicController.playMusic(evilTheme);
};
