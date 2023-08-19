import { type ScreenHandlerContext, ScreenInputHandler } from './ScreenInputHandler';
import { startGameDebug } from '../../actions/startGameDebug';
import { startGame } from '../../actions/startGame';
import { type KeyCommand, ModifierKey } from '../inputTypes';
import { toggleFullScreen } from '../../utils/dom';
import { GameScreen } from '../../core/GameScreen';
import { Feature } from '../../utils/features';

const handleKeyCommand = async (
  command: KeyCommand,
  { state, imageFactory, mapFactory }: ScreenHandlerContext
) => {
  const { key, modifiers } = command;
  switch (key) {
    case 'ENTER':
      if (modifiers.includes(ModifierKey.ALT)) {
        await toggleFullScreen();
      } else {
        if (Feature.isEnabled(Feature.DEBUG_LEVEL) && modifiers.includes(ModifierKey.SHIFT)) {
          const mapInstance = await mapFactory.loadMap(
            { type: 'predefined', id: 'test' },
            { state, imageFactory }
          );
          await startGameDebug(mapInstance, { state });
        } else {
          await startGame({ state, imageFactory, mapFactory });
        }
        state.setScreen(GameScreen.GAME);
      }
      break;
    case 'ESCAPE':
      state.setScreen(GameScreen.GAME);
  }
};

export default {
  handleKeyCommand
} as ScreenInputHandler;