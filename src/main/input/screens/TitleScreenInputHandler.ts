import { type ScreenHandlerContext, ScreenInputHandler } from './ScreenInputHandler';
import MapFactory from '../../maps/MapFactory';
import { startGameDebug } from '../../actions/startGameDebug';
import { startGame } from '../../actions/startGame';
import { type KeyCommand } from '../inputTypes';
import { toggleFullScreen } from '../../utils/dom';
import { GameScreen } from '../../core/GameScreen';
import { Feature } from '../../utils/features';

const handleKeyCommand = async (
  command: KeyCommand,
  { state, imageFactory }: ScreenHandlerContext
) => {
  const { key, modifiers } = command;
  switch (key) {
    case 'ENTER':
      if (modifiers.includes('ALT')) {
        await toggleFullScreen();
      } else {
        if (Feature.isEnabled(Feature.DEBUG_LEVEL) && modifiers.includes('SHIFT')) {
          const mapInstance = await MapFactory.loadMap(
            { type: 'predefined', id: 'test' },
            { state, imageFactory }
          );
          await startGameDebug(mapInstance, { state });
        } else {
          await startGame({ state });
        }
      }
      state.setScreen(GameScreen.GAME);
      break;
    case 'ESCAPE':
      state.setScreen(GameScreen.GAME);
  }
};

export default {
  handleKeyCommand
} as ScreenInputHandler;