import { KeyCommand } from '@lib/input/inputTypes';

export interface ScreenInputHandler {
  handleKeyDown: (command: KeyCommand) => Promise<void>;
  handleKeyUp: (command: KeyCommand) => Promise<void>;
}
