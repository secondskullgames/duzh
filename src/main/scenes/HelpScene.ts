import { Scene } from '@main/scenes/Scene';
import { SceneName } from '@main/scenes/SceneName';
import { ClickCommand, KeyCommand, ModifierKey } from '@lib/input/inputTypes';
import { Graphics } from '@lib/graphics/Graphics';
import { isMobileDevice, toggleFullScreen } from '@lib/utils/dom';
import { FontName } from '@main/graphics/Fonts';
import { Pixel } from '@lib/geometry/Pixel';
import { Color } from '@lib/graphics/Color';
import { Alignment, drawAligned } from '@main/graphics/RenderingUtils';
import Colors from '@main/graphics/Colors';
import { LINE_HEIGHT } from '@main/graphics/constants';
import { TextRenderer } from '@main/graphics/TextRenderer';
import ImageFactory from '@lib/graphics/images/ImageFactory';
import { Game } from '@main/core/Game';
import { inject, injectable } from 'inversify';

const BACKGROUND_FILENAME = 'bordered_background';

@injectable()
export class HelpScene implements Scene {
  readonly name = SceneName.HELP;

  constructor(
    @inject(TextRenderer)
    private readonly textRenderer: TextRenderer,
    @inject(ImageFactory)
    private readonly imageFactory: ImageFactory
  ) {}

  handleKeyDown = async (command: KeyCommand, game: Game) => {
    const { state } = game;
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

  handleClick = async (_: ClickCommand, game: Game) => {
    const { state } = game;
    state.setScene(SceneName.GAME);
  };

  render = async (game: Game, graphics: Graphics) => {
    const { imageFactory } = this;
    const image = await imageFactory.getImage({ filename: BACKGROUND_FILENAME });
    graphics.drawScaledImage(image, {
      left: 0,
      top: 0,
      width: game.config.screenWidth,
      height: game.config.screenHeight
    });

    const left = 10;
    const top = 10;

    const intro = [
      'Welcome to the Dungeons of Duzh! To escape, you must brave untold',
      'terrors on eight floors. Make use of every weapon available, hone',
      'your skills through combat, and beware the Horned Wizard.'
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

    if (isMobileDevice()) {
      this._printMobileInstructions(graphics, {
        x: left,
        y: top + (intro.length + 2) * LINE_HEIGHT
      });
    } else {
      this._printKeyboardInstructions(graphics, {
        x: left,
        y: top + (intro.length + 2) * LINE_HEIGHT
      });
    }
  };

  private _printKeyboardInstructions = (
    graphics: Graphics,
    { x: left, y: top }: Pixel
  ) => {
    const keys: [string, string][] = [
      ['WASD / Arrow keys', 'Move around, melee attack'],
      ['Tab', 'Open inventory screen'],
      ['Enter', 'Pick up item, enter portal, go down stairs'],
      ['Number keys (1-9)', 'Special moves (press arrow to execute)'],
      ['Shift + (direction)', 'Use bow and arrows'],
      ['Alt + (direction)', 'Dash'],
      ['M', 'View map screen'],
      ['C', 'View character screen'],
      ['F1', 'View this screen']
    ];

    for (let i = 0; i < keys.length; i++) {
      const y = top + LINE_HEIGHT * i;
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

  private _printMobileInstructions = (graphics: Graphics, { x: left, y: top }: Pixel) => {
    const keys: [string, string][] = [
      ['Click on current tile', 'Pick up item, enter portal, go down stairs'],
      ['Click on adjacent tiles', 'Move around, melee attack'],
      ['Action buttons', 'Special moves (click adjacent tile to use)'],
      ['"I" menu button', 'Open inventory screen'],
      ['"M" menu button', 'View map screen'],
      ['"C" menu button', 'View character screen'],
      ['"?" menu button', 'View this screen']
    ];

    for (let i = 0; i < keys.length; i++) {
      const y = top + LINE_HEIGHT * i;
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
        { x: left + 225, y },
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
