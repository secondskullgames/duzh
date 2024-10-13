import { SceneName } from '@main/scenes/SceneName';
import { Graphics } from '@lib/graphics/Graphics';
import { ClickCommand, KeyCommand } from '@lib/input/inputTypes';
import { Game } from '@main/core/Game';

export interface Scene {
  readonly name: SceneName;
  render: (game: Game, graphics: Graphics) => Promise<void>;
  handleKeyDown: (command: KeyCommand, game: Game) => Promise<void>;
  handleKeyUp: (command: KeyCommand, game: Game) => Promise<void>;
  handleClick: (command: ClickCommand, game: Game) => Promise<void>;
}
