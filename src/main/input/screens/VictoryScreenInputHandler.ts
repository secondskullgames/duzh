import ScreenInputHandler, { ScreenHandlerContext } from './ScreenInputHandler';
import { KeyCommand } from '../inputTypes';
import { showSplashScreen } from '../../actions/showSplashScreen';

const handleKeyCommand = async (command: KeyCommand, { state, renderer, imageFactory }: ScreenHandlerContext) => {
  switch (command.key) {
    case 'ENTER':
      await showSplashScreen({
        state,
        renderer,
        imageFactory
      });
  }
};

const VictoryScreenInputHandler: ScreenInputHandler = {
  handleKeyCommand
};

export default VictoryScreenInputHandler;