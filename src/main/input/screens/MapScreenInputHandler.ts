import { ScreenInputHandler } from './ScreenInputHandler';
import { type KeyCommand, ModifierKey } from '../inputTypes';
import { toggleFullScreen } from '@main/utils/dom';
import { GameScreen, Session } from '@main/core';
import { inject, injectable } from 'inversify';

@injectable()
export default class MapScreenInputHandler implements ScreenInputHandler {
  constructor(
    @inject(Session.SYMBOL)
    private readonly session: Session
  ) {}

  handleKeyCommand = async (command: KeyCommand) => {
    const { session } = this;
    const { key, modifiers } = command;

    switch (key) {
      case 'M':
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
}
