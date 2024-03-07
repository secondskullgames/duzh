import { ScreenInputHandler } from './ScreenInputHandler';
import { type KeyCommand, ModifierKey } from '../inputTypes';
import { toggleFullScreen } from '@main/utils/dom';
import { GameScreen } from '@main/core/GameScreen';
import { Session } from '@main/core/Session';
import { inject, injectable } from 'inversify';

@injectable()
export default class HelpScreenInputHandler implements ScreenInputHandler {
  constructor(
    @inject(Session)
    private readonly session: Session
  ) {}

  handleKeyCommand = async (command: KeyCommand) => {
    const { session } = this;
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
}
