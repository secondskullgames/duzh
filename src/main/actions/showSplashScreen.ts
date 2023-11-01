import Music from '../sounds/Music';
import GameState from '../core/GameState';
import { GameScreen } from '../core/GameScreen';

type Context = Readonly<{
  state: GameState;
}>;

export const showSplashScreen = async ({ state }: Context) => {
  state.setScreen(GameScreen.TITLE);
  const evilTheme = await Music.loadMusic('evil');
  Music.playMusic(evilTheme);
};
