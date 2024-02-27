import { GameScreen } from '@main/core/GameScreen';
import { Session } from '@main/core/Session';
import { GameState } from '@main/core/GameState';
import { Feature } from '@main/utils/features';

export const showSplashScreen = async (state: GameState, session: Session) => {
  session.setScreen(GameScreen.TITLE);
  if (Feature.isEnabled(Feature.TITLE_MUSIC)) {
    const musicController = state.getMusicController();
    const evilTheme = await musicController.loadMusic('evil');
    musicController.playMusic(evilTheme);
  }
};
