import Music from '../sounds/Music';
import GameState from '../core/GameState';
import { addInitialState } from './addInitialState';
import ImageFactory from '../graphics/images/ImageFactory';
import Ticker from '../core/Ticker';

type Context = Readonly<{
  state: GameState,
  imageFactory: ImageFactory,
  ticker: Ticker
}>;

export const showSplashScreen = async ({ state, imageFactory, ticker }: Context) => {
  state.reset();
  await addInitialState({ state, imageFactory, ticker })
  const evilTheme = await Music.loadMusic('evil');
  Music.playMusic(evilTheme);
};