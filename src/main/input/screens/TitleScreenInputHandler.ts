import { type ScreenHandlerContext, ScreenInputHandler } from './ScreenInputHandler';
import { type KeyCommand, ModifierKey } from '../inputTypes';
import { toggleFullScreen } from '../../utils/dom';
import { GameScreen } from '../../core/GameScreen';
import { Feature } from '../../utils/features';
import { addInitialStateDebug } from '../../client/addInitialStateDebug';
import { startGame } from '../../actions/startGame';

const handleKeyCommand = async (
  command: KeyCommand,
  { game, session, imageFactory, mapFactory, ticker }: ScreenHandlerContext
) => {
  const { key, modifiers } = command;
  switch (key) {
    case 'ENTER':
      if (modifiers.includes(ModifierKey.ALT)) {
        await toggleFullScreen();
      } else {
        if (Feature.isEnabled(Feature.DEBUG_LEVEL) && modifiers.includes(ModifierKey.SHIFT)) {
          await addInitialStateDebug({ game, imageFactory, ticker });
        } else {
          const game = session.getGameDefinition().newGame({ imageFactory, ticker });
        }
        await startGame({ game, imageFactory, mapFactory });
        session.setScreen(GameScreen.GAME);
      }
      break;
    case 'ESCAPE':
      session.setScreen(GameScreen.GAME);
  }
};

export default {
  handleKeyCommand
} as ScreenInputHandler;