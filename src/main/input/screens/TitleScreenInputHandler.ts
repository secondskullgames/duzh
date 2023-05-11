import ScreenHandler, { ScreenHandlerProps } from './ScreenHandler';
import { GameScreen } from '../../types/types';
import MapFactory from '../../maps/MapFactory';
import { startGameDebug } from '../../actions/startGameDebug';
import { startGame } from '../../actions/startGame';
import { KeyCommand } from '../inputTypes';

const handleKeyCommand = async (command: KeyCommand, { state, renderer, imageFactory }: ScreenHandlerProps) => {
  const { key, modifiers } = command;
  switch (key) {
    case 'ENTER':
      state.setScreen(GameScreen.GAME);
      if (modifiers.includes('SHIFT')) {
        const mapInstance = await MapFactory.loadMap(
          { type: 'predefined', id: 'test' },
          { state, imageFactory }
        );
        await startGameDebug(mapInstance, {
          state,
          renderer
        });
      } else {
        await startGame({
          state,
          renderer
        });
      }
      break;
  }
};

const TitleScreenInputHandler: ScreenHandler = {
  handleKeyCommand
};

export default TitleScreenInputHandler;