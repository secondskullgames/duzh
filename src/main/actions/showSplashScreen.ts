import Music from '../sounds/Music';
import Game from '../core/Game';
import { GameScreen } from '../core/GameScreen';

type Context = Readonly<{
  game: Game
}>;

export const showSplashScreen = async ({ game }: Context) => {
  game.setScreen(GameScreen.TITLE);
  const evilTheme = await Music.loadMusic('evil');
  Music.playMusic(evilTheme);
};