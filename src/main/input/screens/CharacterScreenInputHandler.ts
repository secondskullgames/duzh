import { ScreenInputHandler } from './ScreenInputHandler';
import { type KeyCommand, ModifierKey } from '../inputTypes';
import { toggleFullScreen } from '../../utils/dom';
import { GameScreen } from '../../core/GameScreen';
import { Session } from '../../core/Session';
import { inject, injectable } from 'inversify';

@injectable()
export default class CharacterScreenInputHandler implements ScreenInputHandler {
  constructor(
    @inject(Session.SYMBOL)
    private readonly session: Session
  ) {}

  handleKeyCommand = async (command: KeyCommand) => {
    const { session } = this;

    switch (command.key) {
      case 'C':
        session.setScreen(GameScreen.GAME);
        break;
      case 'F1':
        session.setScreen(GameScreen.HELP);
        break;
      case 'ENTER':
        if (command.modifiers.includes(ModifierKey.ALT)) {
          await toggleFullScreen();
        }
        break;
      case 'ESCAPE':
        session.setScreen(GameScreen.GAME);
    }
  };
}
