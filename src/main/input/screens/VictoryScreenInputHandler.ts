import { ScreenInputHandler } from './ScreenInputHandler';
import { type KeyCommand, ModifierKey } from '@lib/input/inputTypes';
import { showSplashScreen } from '@main/actions/showSplashScreen';
import { toggleFullScreen } from '@lib/utils/dom';
import { GameScreen } from '@main/core/GameScreen';
import { Session } from '@main/core/Session';
import { GameState } from '@main/core/GameState';
import { inject, injectable } from 'inversify';

@injectable()
export default class VictoryScreenInputHandler implements ScreenInputHandler {
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
      case 'ESCAPE':
        session.setScreen(GameScreen.GAME);
    }
  };

  handleKeyUp = async () => {};
}
