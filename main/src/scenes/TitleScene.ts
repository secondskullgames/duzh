import { Graphics } from '@duzh/graphics';
import { GameController } from '@main/controllers/GameController';
import { Game } from '@main/core/Game';
import { ClickCommand, KeyCommand, ModifierKey } from '@main/input/inputTypes';
import { Scene } from '@main/scenes/Scene';
import { SceneName } from '@main/scenes/SceneName';
import { toggleFullScreen } from '@main/utils/dom';
import { TitleSceneRenderer } from '../graphics/renderers/TitleSceneRenderer';

export class TitleScene implements Scene {
  readonly name = SceneName.TITLE;

  constructor(
    private readonly game: Game,
    private readonly gameController: GameController,
    private readonly renderer: TitleSceneRenderer
  ) {}

  handleKeyDown = async (command: KeyCommand) => {
    const { key, modifiers } = command;

    switch (key) {
      case 'ENTER':
        if (modifiers.includes(ModifierKey.ALT)) {
          await toggleFullScreen();
        } else {
          await this.gameController.handleStartGame(this.game);
        }
        break;
    }
  };

  handleKeyUp = async () => {};

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handleClick = async (_: ClickCommand) => {
    await this.gameController.handleStartGame(this.game);
  };

  render = async (graphics: Graphics) => {
    await this.renderer.render(graphics);
  };
}
