import { ScreenInputHandler } from './ScreenInputHandler';
import { type KeyCommand, ModifierKey, TouchCommand } from '@lib/input/inputTypes';
import { showSplashScreen } from '@main/actions/showSplashScreen';
import { toggleFullScreen } from '@lib/utils/dom';
import { Session } from '@main/core/Session';
import { GameState } from '@main/core/GameState';
import { inject, injectable } from 'inversify';

@injectable()
export default class GameOverScreenInputHandler implements ScreenInputHandler {
  constructor(
    @inject(Session)
    private readonly session: Session,
    @inject(GameState)
    private readonly state: GameState
  ) {}

  handleKeyDown = async (command: KeyCommand) => {
    const { state, session } = this;
    const { key, modifiers } = command;

    switch (key) {
      case 'ENTER':
        if (modifiers.includes(ModifierKey.ALT)) {
          await toggleFullScreen();
        } else {
          await showSplashScreen(state, session);
          state.reset();
          session.reset();
        }
        break;
    }
  };

  handleKeyUp = async () => {};

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handleTouchDown = async (_: TouchCommand) => {
    const { state, session } = this;
    await showSplashScreen(state, session);
    state.reset();
    session.reset();
  };
}
