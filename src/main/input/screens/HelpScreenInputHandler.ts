import { ScreenInputHandler, type ScreenHandlerContext } from './ScreenInputHandler';
import { type KeyCommand } from '../inputTypes';

const handleKeyCommand = async (command: KeyCommand, { state, renderer, imageFactory }: ScreenHandlerContext) => {
  switch (command.key) {
    case 'F1':
      state.showPrevScreen();
  }
};

const HelpScreenInputHandler: ScreenInputHandler = {
  handleKeyCommand
};

export default HelpScreenInputHandler;