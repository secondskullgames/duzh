import Music from '../sounds/Music';
import { addInitialState } from './addInitialState';
import { GlobalContext } from '../core/GlobalContext';

export const showSplashScreen = async (context: GlobalContext) => {
  context.state.reset();
  await addInitialState(context)
  const evilTheme = await Music.loadMusic('evil');
  Music.playMusic(evilTheme);
};