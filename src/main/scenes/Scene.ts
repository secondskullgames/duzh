import { SceneName } from '@main/scenes/SceneName';
import { Graphics } from '@lib/graphics/Graphics';
import { ClickCommand, KeyCommand } from '@lib/input/inputTypes';

export interface Scene {
  readonly name: SceneName;
  render: (graphics: Graphics) => Promise<void>;
  handleKeyDown: (command: KeyCommand) => Promise<void>;
  handleKeyUp: (command: KeyCommand) => Promise<void>;
  handleClick: (event: ClickCommand) => Promise<void>;
}
