import Music from '../sounds/Music';
import { GameScreen } from '../core/GameScreen';
import { Session } from '../core/Session';

export const showSplashScreen = async (session: Session) => {
  session.setScreen(GameScreen.TITLE);
  const evilTheme = await Music.loadMusic('evil');
  Music.playMusic(evilTheme);
};
