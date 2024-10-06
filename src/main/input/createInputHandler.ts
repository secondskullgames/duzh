import InputHandler from '@lib/input/InputHandler';
import { mapToClickCommand, mapToKeyCommand } from '@main/input/inputMappers';
import { isMobileDevice } from '@lib/utils/dom';
import type { ClickCommand, KeyCommand } from '@lib/input/inputTypes';
import { Globals } from '@main/core/globals';

export const createInputHandler = (): InputHandler => {
  const { session } = Globals;
  const onKeyDown = async (event: KeyboardEvent) => {
    const command: KeyCommand | null = mapToKeyCommand(event);
    if (!command) {
      return;
    }
    event.preventDefault();
    const currentScene = session.getCurrentScene();
    if (currentScene) {
      await currentScene.handleKeyDown(command);
    }
  };

  const onKeyUp = async (event: KeyboardEvent) => {
    event.preventDefault();
    const command: KeyCommand | null = mapToKeyCommand(event);
    if (!command) {
      return;
    }
    const currentScene = session.getCurrentScene();
    if (currentScene) {
      await currentScene.handleKeyUp(command);
    }
  };

  const onClick = async (event: MouseEvent) => {
    if (!isMobileDevice()) {
      return;
    }
    event.preventDefault();
    const command: ClickCommand | null = mapToClickCommand(event);
    if (!command) {
      return;
    }
    const currentScene = session.getCurrentScene();
    if (currentScene) {
      await currentScene.handleClick(command);
    }
  };

  const onTouchDown = async (event: TouchEvent) => {
    if (!isMobileDevice()) {
      return;
    }
    event.preventDefault();
    const command: ClickCommand | null = mapToClickCommand(event);
    if (!command) {
      return;
    }
    const currentScene = session.getCurrentScene();
    if (currentScene) {
      await currentScene.handleClick(command);
    }
  };

  return new InputHandler({ onKeyDown, onKeyUp, onClick, onTouchDown });
};
