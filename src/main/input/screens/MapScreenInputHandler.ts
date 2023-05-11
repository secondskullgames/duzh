import ScreenHandler, { ScreenHandlerProps } from './ScreenHandler';
import { KeyCommand } from '../inputTypes';
import { GameScreen } from '../../types/types';

const handleKeyCommand = async (command: KeyCommand, { state, renderer, imageFactory }: ScreenHandlerProps) => {
  switch (command.key) {
    case 'M':
      state.setScreen(GameScreen.GAME);
      await renderer.render();
      break;
    case 'F1':
      state.setScreen(GameScreen.HELP);
      await renderer.render();
  }
};

const MapScreenInputHandler: ScreenHandler = {
  handleKeyCommand
};

export default MapScreenInputHandler;