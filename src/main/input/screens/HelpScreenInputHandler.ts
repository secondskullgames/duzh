import ScreenHandler, { ScreenHandlerProps } from './ScreenHandler';
import { KeyCommand } from '../inputTypes';

const handleKeyCommand = async (command: KeyCommand, { state, renderer, imageFactory }: ScreenHandlerProps) => {
  switch (command.key) {
    case 'F1':
      state.showPrevScreen();
  }
};

const HelpScreenInputHandler: ScreenHandler = {
  handleKeyCommand
};

export default HelpScreenInputHandler;