import InputHandlerType, { InputHandlerProps } from './InputHandlerType';
import { KeyCommand } from '../inputTypes';
import { GameScreen } from '../../types/types';

const handleKeyCommand = async (command: KeyCommand, { state, renderer, imageFactory }: InputHandlerProps) => {
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

const MapScreenInputHandler: InputHandlerType = {
  handleKeyCommand
};

export default MapScreenInputHandler;