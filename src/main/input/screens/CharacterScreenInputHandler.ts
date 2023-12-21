import { type ScreenHandlerContext, ScreenInputHandler } from './ScreenInputHandler';
import { type KeyCommand, ModifierKey } from '../inputTypes';
import { toggleFullScreen } from '../../utils/dom';
import { GameScreen } from '../../core/GameScreen';

const handleKeyCommand = async (
  command: KeyCommand,
  { session }: ScreenHandlerContext
) => {
  const { key, modifiers } = command;
  switch (key) {
    case 'C':
      session.setScreen(GameScreen.GAME);
      break;
    case 'F1':
      session.setScreen(GameScreen.HELP);
      break;
    case 'ENTER':
      if (modifiers.includes(ModifierKey.ALT)) {
        await toggleFullScreen();
      }
      break;
    case 'ESCAPE':
      session.setScreen(GameScreen.GAME);
  }
};

export default {
  handleKeyCommand
} as ScreenInputHandler;
