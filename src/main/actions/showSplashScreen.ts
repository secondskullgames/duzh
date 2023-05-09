import GameRenderer from '../graphics/renderers/GameRenderer';
import Music from '../sounds/Music';
import GameState from '../core/GameState';
import { addInitialState } from './addInitialState';
import ImageFactory from '../graphics/images/ImageFactory';

type Props = Readonly<{
  state: GameState,
  renderer: GameRenderer,
  imageFactory: ImageFactory
}>;

export const showSplashScreen = async ({ state, renderer, imageFactory }: Props) => {
  state.reset();
  await addInitialState({ state, imageFactory })
  await renderer.render();
  const evilTheme = await Music.loadMusic('evil');
  Music.playMusic(evilTheme);
};