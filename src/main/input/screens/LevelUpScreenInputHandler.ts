import { type ScreenHandlerContext, ScreenInputHandler } from './ScreenInputHandler';
import { type KeyCommand } from '../inputTypes';
import { GameScreen } from '../../core/GameScreen';

const handleKeyCommand = async (command: KeyCommand, { state, renderer, imageFactory }: ScreenHandlerContext) => {
  switch (command.key) {
    case 'L':
      state.showPrevScreen();
      await renderer.render();
      break;
    case 'F1':
      state.setScreen(GameScreen.HELP);
      await renderer.render();
  }
};

const HelpScreenInputHandler: ScreenInputHandler = {
  handleKeyCommand
};

export default HelpScreenInputHandler;