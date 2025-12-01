import { Graphics } from '@duzh/graphics';
import { ClickCommand, KeyCommand, ModifierKey } from '@main/input/inputTypes';
import { toggleFullScreen } from '@main/utils/dom';
import { Game } from '@main/core/Game';
import { Scene } from '@main/scenes/Scene';
import { SceneName } from '@main/scenes/SceneName';
import { GameController } from '../controllers/GameController';
import { VictorySceneRenderer } from '../graphics/renderers/VictorySceneRenderer';

export class VictoryScene implements Scene {
  readonly name = SceneName.VICTORY;

  constructor(
    private readonly game: Game,
    private readonly gameController: GameController,
    private readonly renderer: VictorySceneRenderer
  ) {}

  render = async (graphics: Graphics) => {
    await this.renderer.render(graphics);
  };

  handleKeyDown = async (command: KeyCommand) => {
    const { state } = this.game;
    const { key, modifiers } = command;
    switch (key) {
      case 'ENTER':
        if (modifiers.includes(ModifierKey.ALT)) {
          await toggleFullScreen();
        } else {
          await this.gameController.showTitleScene(this.game);
        }
        break;
      case 'ESCAPE':
        state.setScene(SceneName.GAME);
    }
  };

  handleKeyUp = async () => {};

  handleClick = async (_: ClickCommand) => {
    await this.gameController.showTitleScene(this.game);
  };
}
