import { ScreenInputHandler, type ScreenHandlerContext } from './ScreenInputHandler';
import { type KeyCommand, ModifierKey } from '../inputTypes';
import { showSplashScreen } from '../../actions/showSplashScreen';
import { toggleFullScreen } from '../../utils/dom';
import { GameScreen } from '../../core/GameScreen';
import { addInitialState } from '../../actions/addInitialState';

const handleKeyCommand = async (
  command: KeyCommand,
  { state, imageFactory, mapFactory, session }: ScreenHandlerContext
) => {
  const { key, modifiers } = command;
  switch (key) {
    case 'ENTER':
      if (modifiers.includes(ModifierKey.ALT)) {
        await toggleFullScreen();
      } else {
        await showSplashScreen({ state, session });
        state.reset();
        session.reset();
        await addInitialState({
          state,
          imageFactory,
          mapFactory,
          session
        });
      }
      break;
    case 'ESCAPE':
      session.setScreen(GameScreen.GAME);
  }
};

export default {
  handleKeyCommand
} as ScreenInputHandler;
