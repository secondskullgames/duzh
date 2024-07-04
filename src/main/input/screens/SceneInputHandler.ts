import { KeyCommand, ClickCommand } from '@lib/input/inputTypes';

export interface SceneInputHandler {
  handleKeyDown: (command: KeyCommand) => Promise<void>;
  handleKeyUp: (command: KeyCommand) => Promise<void>;
  handleClick: (event: ClickCommand) => Promise<void>;
}
