import { ScreenInputHandler, type ScreenHandlerContext } from './ScreenInputHandler';
import { type KeyCommand } from '../inputTypes';
import { GameScreen } from '../../types/types';

const handleKeyCommand = async (command: KeyCommand, { state, renderer, imageFactory }: ScreenHandlerContext) => {
  switch (command.key) {
    case 'C':
      state.setScreen(GameScreen.GAME);
      await renderer.render();
      break;
    case 'F1':
      state.setScreen(GameScreen.HELP);
      await renderer.render();
  }
};

export default {
  handleKeyCommand
} as ScreenInputHandler;