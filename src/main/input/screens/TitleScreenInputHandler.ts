import { ScreenInputHandler, type ScreenHandlerContext } from './ScreenInputHandler';
import { GameScreen } from '../../types/types';
import MapFactory from '../../maps/MapFactory';
import { startGameDebug } from '../../actions/startGameDebug';
import { startGame } from '../../actions/startGame';
import { type KeyCommand } from '../inputTypes';

const handleKeyCommand = async (
  command: KeyCommand,
  { state, renderer, imageFactory }: ScreenHandlerContext
) => {
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

const TitleScreenInputHandler: ScreenInputHandler = {
  handleKeyCommand
};

export default TitleScreenInputHandler;