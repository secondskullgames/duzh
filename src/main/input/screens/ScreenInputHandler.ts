import { KeyCommand } from '../inputTypes';

export interface ScreenInputHandler {
  handleKeyCommand: (command: KeyCommand) => Promise<void>;
}
