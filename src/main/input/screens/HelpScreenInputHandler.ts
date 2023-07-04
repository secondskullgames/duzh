import { ScreenInputHandler } from './ScreenInputHandler';
import { type KeyCommand } from '../inputTypes';
import { toggleFullScreen } from '../../utils/dom';
import { GameScreen } from '../../core/GameScreen';
import { GlobalContext } from '../../core/GlobalContext';

const handleKeyCommand = async (command: KeyCommand, context: GlobalContext) => {
  const { key, modifiers } = command;
  const { state } = context;
  switch (key) {
    case 'F1':
      state.showPrevScreen();
      break;
    case 'ENTER':
      if (modifiers.includes('ALT')) {
        await toggleFullScreen();
      }
      break;
    case 'ESCAPE':
      state.setScreen(GameScreen.GAME);
  }
};

export default {
  handleKeyCommand
} as ScreenInputHandler;
