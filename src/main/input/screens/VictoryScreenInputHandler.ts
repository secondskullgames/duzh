import { ScreenInputHandler, type ScreenHandlerContext } from './ScreenInputHandler';
import { type KeyCommand, ModifierKey } from '../inputTypes';
import { showSplashScreen } from '../../actions/showSplashScreen';
import { toggleFullScreen } from '../../utils/dom';
import { GameScreen } from '../../core/GameScreen';
import { addInitialState } from '../../actions/addInitialState';

const handleKeyCommand = async (
  command: KeyCommand,
  { state, ticker }: ScreenHandlerContext
) => {
  const { key, modifiers } = command;
  switch (key) {
    case 'ENTER':
      if (modifiers.includes(ModifierKey.ALT)) {
        await toggleFullScreen();
      } else {
        await showSplashScreen({ state });
        await state.reset();
        await addInitialState({
          state,
          ticker
        });
      }
      break;
    case 'ESCAPE':
      state.setScreen(GameScreen.GAME);
  }
};

export default {
  handleKeyCommand
} as ScreenInputHandler;
