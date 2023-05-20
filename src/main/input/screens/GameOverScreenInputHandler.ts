import { ScreenInputHandler, type ScreenHandlerContext } from './ScreenInputHandler';
import { type KeyCommand } from '../inputTypes';
import { showSplashScreen } from '../../actions/showSplashScreen';

const handleKeyCommand = async (
  command: KeyCommand,
  { state, renderer, imageFactory }: ScreenHandlerContext
) => {
  switch (command.key) {
    case 'ENTER':
      await showSplashScreen({
        state,
        renderer,
        imageFactory
      });
  }
};

const GameOverScreenInputHandler: ScreenInputHandler = {
  handleKeyCommand
};

export default GameOverScreenInputHandler;