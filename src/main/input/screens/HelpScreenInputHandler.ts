import { ScreenInputHandler } from './ScreenInputHandler';
import { type KeyCommand, ModifierKey, TouchCommand } from '@lib/input/inputTypes';
import { toggleFullScreen } from '@lib/utils/dom';
import { GameScreen } from '@main/core/GameScreen';
import { Session } from '@main/core/Session';
import { inject, injectable } from 'inversify';

@injectable()
export default class HelpScreenInputHandler implements ScreenInputHandler {
  constructor(
    @inject(Session)
    private readonly session: Session
  ) {}

  handleKeyDown = async (command: KeyCommand) => {
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

  handleKeyUp = async () => {};

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handleTouchDown = async (_: TouchCommand) => {
    const { session } = this;
    session.setScreen(GameScreen.GAME);
  };
}
