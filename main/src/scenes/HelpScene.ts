import { Scene } from '@main/scenes/Scene';
import { SceneName } from '@main/scenes/SceneName';
import { ClickCommand, KeyCommand, ModifierKey } from '@main/input/inputTypes';
import { Graphics } from '@duzh/graphics';
import { toggleFullScreen } from '@main/utils/dom';
import { Game } from '@main/core/Game';
import { HelpSceneRenderer } from '../graphics/renderers/HelpSceneRenderer';

export class HelpScene implements Scene {
  readonly name = SceneName.HELP;

  constructor(
    private readonly game: Game,
    private readonly renderer: HelpSceneRenderer
  ) {}

  handleKeyDown = async (command: KeyCommand) => {
    const { state } = this.game;
    const { key, modifiers } = command;

    switch (key) {
      case 'F1':
        state.showPrevScene();
        break;
      case 'ENTER':
        if (modifiers.includes(ModifierKey.ALT)) {
          await toggleFullScreen();
        }
        break;
      case 'ESCAPE':
        state.setScene(SceneName.GAME);
    }
  };

  handleKeyUp = async () => {};

  handleClick = async (_: ClickCommand) => {
    const { state } = this.game;
    state.setScene(SceneName.GAME);
  };

  render = async (graphics: Graphics) => {
    await this.renderer.render(graphics);
  };
}
