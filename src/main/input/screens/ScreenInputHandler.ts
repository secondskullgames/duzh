import { KeyCommand } from '@lib/input/inputTypes';

export interface ScreenInputHandler {
  handleKeyCommand: (command: KeyCommand) => Promise<void>;
}
