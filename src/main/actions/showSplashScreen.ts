import Music from '../sounds/Music';
import GameState from '../core/GameState';
import { addInitialState } from './addInitialState';
import ImageFactory from '../graphics/images/ImageFactory';
import Ticker from '../core/Ticker';
import MapFactory from '../maps/MapFactory';

type Context = Readonly<{
  state: GameState,
  mapFactory: MapFactory,
  imageFactory: ImageFactory,
  ticker: Ticker
}>;

export const showSplashScreen = async ({ state, mapFactory, imageFactory, ticker }: Context) => {
  state.reset();
  await addInitialState({ state, imageFactory, mapFactory, ticker })
  const evilTheme = await Music.loadMusic('evil');
  Music.playMusic(evilTheme);
};