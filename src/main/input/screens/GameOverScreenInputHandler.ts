import ScreenHandler, { ScreenHandlerProps } from './ScreenHandler';
import { KeyCommand } from '../inputTypes';
import { showSplashScreen } from '../../actions/showSplashScreen';

const handleKeyCommand = async (command: KeyCommand, { state, renderer, imageFactory }: ScreenHandlerProps) => {
  switch (command.key) {
    case 'ENTER':
      await showSplashScreen({
        state,
        renderer,
        imageFactory
      });
  }
};

const GameOverScreenInputHandler: ScreenHandler = {
  handleKeyCommand
};

export default GameOverScreenInputHandler;