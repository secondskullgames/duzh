import InputHandlerType, { InputHandlerProps } from './InputHandlerType';
import { KeyCommand } from '../inputTypes';

const handleKeyCommand = async (command: KeyCommand, { state, renderer, imageFactory }: InputHandlerProps) => {
  switch (command.key) {
    case 'F1':
      state.showPrevScreen();
  }
};

const HelpScreenInputHandler: InputHandlerType = {
  handleKeyCommand
};

export default HelpScreenInputHandler;