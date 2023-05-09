import InputHandlerType, { InputHandlerProps } from './InputHandlerType';
import { KeyCommand } from '../inputTypes';
import { showSplashScreen } from '../../actions/showSplashScreen';

const handleKeyCommand = async (command: KeyCommand, { state, renderer, imageFactory }: InputHandlerProps) => {
  switch (command.key) {
    case 'ENTER':
      await showSplashScreen({
        state,
        renderer,
        imageFactory
      });
  }
};

const GameOverScreenInputHandler: InputHandlerType = {
  handleKeyCommand
};

export default GameOverScreenInputHandler;