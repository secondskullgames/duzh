import { ScreenInputHandler, type ScreenHandlerContext } from './ScreenInputHandler';
import { type KeyCommand } from '../inputTypes';
import { GameScreen } from '../../types/types';
import { toggleFullScreen } from '../../utils/dom';

const handleKeyCommand = async (command: KeyCommand, { state, renderer, imageFactory }: ScreenHandlerContext) => {
  const { key, modifiers } = command;
  switch (key) {
    case 'M':
      state.setScreen(GameScreen.GAME);
      await renderer.render();
      break;
    case 'F1':
      state.setScreen(GameScreen.HELP);
      await renderer.render();
      break;
    case 'ENTER':
      if (modifiers.includes('ALT')) {
        await toggleFullScreen();
      }
      break;
    case 'ESCAPE':
      state.setScreen(GameScreen.GAME);
      await renderer.render();
  }
};

export default {
  handleKeyCommand
} as ScreenInputHandler;