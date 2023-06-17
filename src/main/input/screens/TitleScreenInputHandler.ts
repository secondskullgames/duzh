import { ScreenInputHandler, type ScreenHandlerContext } from './ScreenInputHandler';
import { GameScreen } from '../../types/types';
import MapFactory from '../../maps/MapFactory';
import { startGameDebug } from '../../actions/startGameDebug';
import { startGame } from '../../actions/startGame';
import { type KeyCommand } from '../inputTypes';
import { toggleFullScreen } from '../../utils/dom';

const handleKeyCommand = async (
  command: KeyCommand,
  { state, renderer, imageFactory }: ScreenHandlerContext
) => {
  const { key, modifiers } = command;
  switch (key) {
    case 'ENTER':
      if (modifiers.includes('ALT')) {
        await toggleFullScreen();
      } else {
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
      }
      break;
    case 'ESCAPE':
      state.setScreen(GameScreen.GAME);
      await renderer.render();
  }
};

export default {
  handleKeyCommand
} as ScreenInputHandler;