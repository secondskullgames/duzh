import { type ScreenInputHandler } from './ScreenInputHandler';
import MapFactory from '../../maps/MapFactory';
import { startGameDebug } from '../../actions/startGameDebug';
import { startGame } from '../../actions/startGame';
import { type KeyCommand } from '../inputTypes';
import { toggleFullScreen } from '../../utils/dom';
import { GameScreen } from '../../core/GameScreen';
import { GlobalContext } from '../../core/GlobalContext';

const handleKeyCommand = async (
  command: KeyCommand,
  context: GlobalContext
) => {
  const { key, modifiers } = command;
  const { state } = context;
  switch (key) {
    case 'ENTER':
      if (modifiers.includes('ALT')) {
        await toggleFullScreen();
      } else {
        state.setScreen(GameScreen.GAME);
        if (modifiers.includes('SHIFT')) {
          const mapInstance = await MapFactory.loadMap(
            { type: 'predefined', id: 'test' },
            context
          );
          await startGameDebug(mapInstance, context);
        } else {
          await startGame(context);
        }
      }
      break;
    case 'ESCAPE':
      state.setScreen(GameScreen.GAME);
  }
};

export default {
  handleKeyCommand
} as ScreenInputHandler;