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
  const onKeyDown = async (event: KeyboardEvent) => {
    const command: KeyCommand | null = mapToCommand(event);
    if (!command) {
      return;
    }
    event.preventDefault();
    const handler: ScreenInputHandler = screenHandlers.getHandler(session.getScreen());
    await handler.handleKeyDown(command);
  };

  const onKeyUp = async (event: KeyboardEvent) => {
    event.preventDefault();
    const command: KeyCommand | null = mapToCommand(event);
    if (!command) {
      return;
    }
    const handler: ScreenInputHandler = screenHandlers.getHandler(session.getScreen());
    await handler.handleKeyUp(command);
  };

  return new InputHandler({ onKeyDown, onKeyUp });
};
