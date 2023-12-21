import Music from '../sounds/Music';
import GameState from '../core/GameState';
import { GameScreen } from '../core/GameScreen';
import { Session } from '../core/Session';

type Context = Readonly<{
  state: GameState;
  session: Session;
}>;

export const showSplashScreen = async ({ session }: Context) => {
  session.setScreen(GameScreen.TITLE);
  const evilTheme = await Music.loadMusic('evil');
  Music.playMusic(evilTheme);
};
