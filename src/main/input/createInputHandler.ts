import InputHandler from '@lib/input/InputHandler';
import { mapToKeyCommand, mapToClickCommand } from '@main/input/inputMappers';
import { ScreenInputHandler } from '@main/input/screens/ScreenInputHandler';
import ScreenHandlers from '@main/input/screens/ScreenHandlers';
import { Session } from '@main/core/Session';
import type { KeyCommand, ClickCommand } from '@lib/input/inputTypes';

type Props = Readonly<{
  screenHandlers: ScreenHandlers;
  session: Session;
}>;

export const createInputHandler = ({ session, screenHandlers }: Props): InputHandler => {
  const onKeyDown = async (event: KeyboardEvent) => {
    const command: KeyCommand | null = mapToKeyCommand(event);
    if (!command) {
      return;
    }
    event.preventDefault();
    const handler: ScreenInputHandler = screenHandlers.getHandler(session.getScreen());
    await handler.handleKeyDown(command);
  };

  const onKeyUp = async (event: KeyboardEvent) => {
    event.preventDefault();
    const command: KeyCommand | null = mapToKeyCommand(event);
    if (!command) {
      return;
    }
    const handler: ScreenInputHandler = screenHandlers.getHandler(session.getScreen());
    await handler.handleKeyUp(command);
  };

  const onClick = async (event: MouseEvent) => {
    event.preventDefault();
    const command: ClickCommand | null = mapToClickCommand(event);
    if (!command) {
      return;
    }
    const handler: ScreenInputHandler = screenHandlers.getHandler(session.getScreen());
    await handler.handleClick(command);
  };

  const onTouchDown = async (event: TouchEvent) => {
    event.preventDefault();
    const command: ClickCommand | null = mapToClickCommand(event);
    if (!command) {
      return;
    }
    const handler: ScreenInputHandler = screenHandlers.getHandler(session.getScreen());
    await handler.handleClick(command);
  };

  return new InputHandler({ onKeyDown, onKeyUp, onClick, onTouchDown });
};
