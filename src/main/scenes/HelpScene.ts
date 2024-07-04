import { Scene } from '@main/scenes/Scene';
import { SceneName } from '@main/scenes/SceneName';
import { ClickCommand, KeyCommand, ModifierKey } from '@lib/input/inputTypes';
import { Graphics } from '@lib/graphics/Graphics';
import { toggleFullScreen } from '@lib/utils/dom';
import { Session } from '@main/core/Session';
import { FontName } from '@main/graphics/Fonts';
import { Pixel } from '@lib/geometry/Pixel';
import { Color } from '@lib/graphics/Color';
import { Alignment, drawAligned } from '@main/graphics/RenderingUtils';
import Colors from '@main/graphics/Colors';
import { LINE_HEIGHT } from '@main/graphics/constants';
import { GameConfig } from '@main/core/GameConfig';
import { TextRenderer } from '@main/graphics/TextRenderer';
import { inject, injectable } from 'inversify';

@injectable()
export class HelpScene implements Scene {
  readonly name = SceneName.HELP;

  constructor(
    @inject(Session)
    private readonly session: Session,
    @inject(GameConfig)
    private readonly gameConfig: GameConfig,
    @inject(TextRenderer)
    private readonly textRenderer: TextRenderer
  ) {}

  handleKeyDown = async (command: KeyCommand) => {
    const { session } = this;
    const { key, modifiers } = command;

    switch (key) {
      case 'F1':
        session.showPrevScene();
        break;
      case 'ENTER':
        if (modifiers.includes(ModifierKey.ALT)) {
          await toggleFullScreen();
        }
        break;
      case 'ESCAPE':
        session.setScene(SceneName.GAME);
    }
  };

  handleKeyUp = async () => {};

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handleClick = async (_: ClickCommand) => {
    const { session } = this;
    session.setScene(SceneName.GAME);
  };

  render = async (graphics: Graphics) => {
    graphics.fill(Colors.BLACK);

    const left = 4;
    const top = 4;

    const intro = [
      'Welcome to the Dungeons of Duzh! To escape, you must brave untold',
      'terrors on eight floors. Make use of every weapon available, hone',
      'your skills through combat, and beware the Horned Wizard.'
    ];

    const keys: [string, string][] = [
      ['WASD / Arrow keys', 'Move around, melee attack'],
      ['Tab', 'Open inventory screen'],
      ['Enter', 'Pick up item, enter portal, go down stairs'],
      ['Number keys (1-9)', 'Special moves (press arrow to execute)'],
      ['Shift + (direction)', 'Use bow and arrows'],
      ['Alt + (direction)', 'Strafe'],
      ['M', 'View map screen'],
      ['C', 'View character screen'],
      ['F1', 'View this screen']
    ];

    for (let i = 0; i < intro.length; i++) {
      const y = top + LINE_HEIGHT * i;
      this._drawText(
        intro[i],
        FontName.APPLE_II,
        { x: left, y },
        Colors.WHITE,
        Alignment.LEFT,
        graphics
      );
    }

    for (let i = 0; i < keys.length; i++) {
      const y = top + LINE_HEIGHT * (i + intro.length + 2);
      graphics.fillRect(
        { left, top: y, width: this.gameConfig.screenWidth, height: LINE_HEIGHT },
        Colors.BLACK
      );
      const [key, description] = keys[i];
      this._drawText(
        key,
        FontName.APPLE_II,
        { x: left, y },
        Colors.WHITE,
        Alignment.LEFT,
        graphics
      );
      this._drawText(
        description,
        FontName.APPLE_II,
        { x: left + 200, y },
        Colors.WHITE,
        Alignment.LEFT,
        graphics
      );
    }
  };

  private _drawText = (
    text: string,
    fontName: FontName,
    pixel: Pixel,
    color: Color,
    textAlign: Alignment,
    graphics: Graphics
  ) => {
    const imageData = this.textRenderer.renderText({
      text,
      fontName,
      color,
      backgroundColor: Colors.BLACK
    });
    drawAligned(imageData, graphics, pixel, textAlign);
  };
}
