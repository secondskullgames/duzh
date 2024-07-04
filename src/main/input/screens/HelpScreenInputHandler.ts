import { SceneInputHandler } from './SceneInputHandler';
import { type KeyCommand, ModifierKey, ClickCommand } from '@lib/input/inputTypes';
import { toggleFullScreen } from '@lib/utils/dom';
import { SceneName } from '@main/scenes/SceneName';
import { Session } from '@main/core/Session';
import { inject, injectable } from 'inversify';

@injectable()
export default class HelpScreenInputHandler implements SceneInputHandler {
  constructor(
    @inject(Session)
    private readonly session: Session
  ) {}

  handleKeyDown = async (command: KeyCommand) => {
    const { session } = this;
    const { key, modifiers } = command;

    switch (key) {
      case 'F1':
        session.showPrevScene();
        break;
      case 'ENTER':
        if (modifiers.includes(ModifierKey.ALT)) {
          await toggleFullScreen();
        }
        break;
      case 'ESCAPE':
        session.setScene(SceneName.GAME);
    }
  };

  handleKeyUp = async () => {};

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handleClick = async (_: ClickCommand) => {
    const { session } = this;
    session.setScene(SceneName.GAME);
  };
}
