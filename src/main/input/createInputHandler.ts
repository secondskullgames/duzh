import InputHandler from '@lib/input/InputHandler';
import { mapToCommand } from '@main/input/inputMappers';
import { ScreenInputHandler } from '@main/input/screens/ScreenInputHandler';
import ScreenHandlers from '@main/input/screens/ScreenHandlers';
import { Session } from '@main/core/Session';
import type { KeyCommand } from '@lib/input/inputTypes';

type Props = Readonly<{
  screenHandlers: ScreenHandlers;
  session: Session;
}>;

export const createInputHandler = ({ session, screenHandlers }: Props): InputHandler => {
  const keyHandler = async (event: KeyboardEvent) => {
    const command: KeyCommand | null = mapToCommand(event);

    if (!command) {
      return;
    }

    event.preventDefault();

    await _handleKeyCommand(command);
  };

  const _handleKeyCommand = async (command: KeyCommand) => {
    const handler: ScreenInputHandler = screenHandlers.getHandler(session.getScreen());
    await handler.handleKeyCommand(command);
  };

  return new InputHandler({ keyHandler });
};
