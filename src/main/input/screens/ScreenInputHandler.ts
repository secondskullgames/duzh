import { KeyCommand, TouchCommand } from '@lib/input/inputTypes';

export interface ScreenInputHandler {
  handleKeyDown: (command: KeyCommand) => Promise<void>;
  handleKeyUp: (command: KeyCommand) => Promise<void>;
  handleTouchDown: (event: TouchCommand) => Promise<void>;
}
