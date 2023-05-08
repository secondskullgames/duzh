import GameRenderer from '../graphics/renderers/GameRenderer';
import Music from '../sounds/Music';
import GameState from '../core/GameState';

type Props = Readonly<{
  state: GameState,
  renderer: GameRenderer
}>;

export const showSplashScreen = async ({ state, renderer }: Props) => {
  state.reset();
  await renderer.render();
  const evilTheme = await Music.loadMusic('evil');
  Music.playMusic(evilTheme);
};