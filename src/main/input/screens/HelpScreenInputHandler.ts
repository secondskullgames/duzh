import { ScreenInputHandler, type ScreenHandlerContext } from './ScreenInputHandler';
import { type KeyCommand, ModifierKey } from '../inputTypes';
import { toggleFullScreen } from '../../utils/dom';
import { GameScreen } from '../../core/GameScreen';

const handleKeyCommand = async (
  command: KeyCommand,
  { session }: ScreenHandlerContext
) => {
  const { key, modifiers } = command;
  switch (key) {
    case 'F1':
      session.showPrevScreen();
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
