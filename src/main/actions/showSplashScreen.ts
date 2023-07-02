import Music from '../sounds/Music';
import GameState from '../core/GameState';
import { addInitialState } from './addInitialState';
import ImageFactory from '../graphics/images/ImageFactory';

type Context = Readonly<{
  state: GameState,
  imageFactory: ImageFactory
}>;

export const showSplashScreen = async ({ state, imageFactory }: Context) => {
  state.reset();
  await addInitialState({ state, imageFactory })
  const evilTheme = await Music.loadMusic('evil');
  Music.playMusic(evilTheme);
};