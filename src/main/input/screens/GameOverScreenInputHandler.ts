import { ScreenInputHandler } from './ScreenInputHandler';
import { type KeyCommand } from '../inputTypes';
import { showSplashScreen } from '../../actions/showSplashScreen';
import { toggleFullScreen } from '../../utils/dom';
import { GameScreen } from '../../core/GameScreen';
import { GlobalContext } from '../../core/GlobalContext';

const handleKeyCommand = async (
  command: KeyCommand,
  context: GlobalContext
) => {
  const { key, modifiers } = command;
  switch (key) {
    case 'ENTER':
      if (modifiers.includes('ALT')) {
        await toggleFullScreen();
      } else {
        await showSplashScreen(context);
      }
      break;
    case 'ESCAPE':
      context.state.setScreen(GameScreen.GAME);
  }
};

export default {
  handleKeyCommand
} as ScreenInputHandler;